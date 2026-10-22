using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Threading;

namespace TeleTerm {
    class Program {
        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool AttachConsole(uint dwProcessId);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool FreeConsole();

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern IntPtr GetStdHandle(int nStdHandle);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        public static extern IntPtr CreateFile(string lpFileName, uint dwDesiredAccess, uint dwShareMode, IntPtr lpSecurityAttributes, uint dwCreationDisposition, uint dwFlagsAndAttributes, IntPtr hTemplateFile);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool CloseHandle(IntPtr hObject);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool GetConsoleScreenBufferInfo(IntPtr hConsoleOutput, out CONSOLE_SCREEN_BUFFER_INFO lpConsoleScreenBufferInfo);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode, EntryPoint = "ReadConsoleOutputW")]
        public static extern bool ReadConsoleOutput(IntPtr hConsoleOutput, [Out] CHAR_INFO[] lpBuffer, COORD dwBufferSize, COORD dwBufferCoord, ref SMALL_RECT lpReadRegion);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode, EntryPoint = "WriteConsoleInputW")]
        public static extern bool WriteConsoleInput(IntPtr hConsoleInput, INPUT_RECORD[] lpBuffer, uint nLength, out uint lpNumberOfEventsWritten);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool WriteFile(IntPtr hFile, byte[] lpBuffer, uint nNumberOfBytesToWrite, out uint lpNumberOfBytesWritten, IntPtr lpOverlapped);

        [DllImport("user32.dll")]
        public static extern uint MapVirtualKey(uint uCode, uint uMapType);

        [DllImport("user32.dll")]
        public static extern short VkKeyScan(char ch);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern uint SetThreadExecutionState(uint esFlags);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern IntPtr CreateToolhelp32Snapshot(uint dwFlags, uint th32ProcessID);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        public static extern bool Process32First(IntPtr hSnapshot, ref PROCESSENTRY32 lppe);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        public static extern bool Process32Next(IntPtr hSnapshot, ref PROCESSENTRY32 lppe);

        public const uint TH32CS_SNAPPROCESS = 0x00000002;

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        public struct PROCESSENTRY32 {
            public uint dwSize;
            public uint cntUsage;
            public uint th32ProcessID;
            public IntPtr th32DefaultHeapID;
            public uint th32ModuleID;
            public uint cntThreads;
            public uint th32ParentProcessID;
            public int pcPriClassBase;
            public uint dwFlags;
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]
            public string szExeFile;
        }

        public const uint ES_CONTINUOUS = 0x80000000;
        public const uint ES_SYSTEM_REQUIRED = 0x00000001;
        public const uint ES_AWAYMODE_REQUIRED = 0x00000040;

        [StructLayout(LayoutKind.Sequential)]
        public struct COORD { public short X; public short Y; }

        [StructLayout(LayoutKind.Sequential)]
        public struct SMALL_RECT { public short Left; public short Top; public short Right; public short Bottom; }

        [StructLayout(LayoutKind.Sequential)]
        public struct CONSOLE_SCREEN_BUFFER_INFO {
            public COORD dwSize;
            public COORD dwCursorPosition;
            public ushort wAttributes;
            public SMALL_RECT srWindow;
            public COORD dwMaximumWindowSize;
        }

        [StructLayout(LayoutKind.Explicit, CharSet = CharSet.Unicode)]
        public struct CHAR_INFO {
            [FieldOffset(0)] public char UnicodeChar;
            [FieldOffset(2)] public ushort Attributes;
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        public struct KEY_EVENT_RECORD {
            public int bKeyDown; // 4-byte Win32 BOOL
            public ushort wRepeatCount; // 2 bytes
            public ushort wVirtualKeyCode; // 2 bytes
            public ushort wVirtualScanCode; // 2 bytes
            public char UnicodeChar; // 2 bytes
            public uint dwControlKeyState; // 4 bytes
        }

        [StructLayout(LayoutKind.Explicit)]
        public struct INPUT_RECORD {
            [FieldOffset(0)] public ushort EventType;
            [FieldOffset(4)] public KEY_EVENT_RECORD KeyEvent;
        }

        static IntPtr g_origStdOut = IntPtr.Zero;

        static void WriteOutput(string text) {
            byte[] bytes = Encoding.UTF8.GetBytes(text + Environment.NewLine);
            uint written;
            if (g_origStdOut != IntPtr.Zero && g_origStdOut != (IntPtr)(-1)) {
                WriteFile(g_origStdOut, bytes, (uint)bytes.Length, out written, IntPtr.Zero);
            } else {
                AttachConsole(0xFFFFFFFF);
                Console.WriteLine(text);
            }
        }

        private static readonly string[] FgAnsi = new string[] {
            "\x1b[30m", "\x1b[34m", "\x1b[32m", "\x1b[36m", "\x1b[31m", "\x1b[35m", "\x1b[33m", "\x1b[37m",
            "\x1b[90m", "\x1b[94m", "\x1b[92m", "\x1b[96m", "\x1b[91m", "\x1b[95m", "\x1b[93m", "\x1b[97m"
        };

        private static readonly string[] BgAnsi = new string[] {
            "\x1b[49m", "\x1b[44m", "\x1b[42m", "\x1b[46m", "\x1b[41m", "\x1b[45m", "\x1b[43m", "\x1b[47m",
            "\x1b[100m", "\x1b[104m", "\x1b[102m", "\x1b[106m", "\x1b[101m", "\x1b[105m", "\x1b[103m", "\x1b[107m"
        };

        static void Main(string[] args) {
            g_origStdOut = GetStdHandle(-11);
            if (args.Length == 0) {
                WriteOutput("Usage: ConsoleBridge.exe <daemon|list|ansi|tree|write|keepalive> [args]");
                return;
            }

            string command = args[0].ToLower();

            if (command == "daemon") {
                RunDaemon();
                return;
            } else if (command == "keepalive") {
                RunKeepAlive();
                return;
            }

            string result = Execute(string.Join(" ", args));
            WriteOutput(result);
        }

        static string Execute(string commandLine) {
            if (string.IsNullOrEmpty(commandLine)) return "{\"error\":\"Empty command\"}";
            string[] parts = commandLine.Trim().Split(new char[] { ' ' }, 3);
            if (parts.Length == 0) return "{\"error\":\"Empty command\"}";

            string command = parts[0].ToLower();
            try {
                if (command == "ping") {
                    return "{\"pong\":true}";
                } else if (command == "list") {
                    return ListProcesses();
                } else if (command == "info" && parts.Length >= 2) {
                    uint pid = uint.Parse(parts[1]);
                    return GetBufferInfo(pid);
                } else if (command == "ansi" && parts.Length >= 2) {
                    uint pid = uint.Parse(parts[1]);
                    return GetAnsiScreen(pid);
                } else if (command == "tree" && parts.Length >= 2) {
                    uint pid = uint.Parse(parts[1]);
                    return GetProcessTree(pid);
                } else if (command == "write" && parts.Length >= 3) {
                    uint pid = uint.Parse(parts[1]);
                    string inputBase64 = parts[2];
                    byte[] bytes = Convert.FromBase64String(inputBase64);
                    string text = Encoding.UTF8.GetString(bytes);
                    return WriteProcessInput(pid, text);
                }
            } catch (Exception ex) {
                return string.Format("{{\"success\":false,\"error\":{0}}}", QuoteJson(ex.Message));
            }
            return "{\"error\":\"Unknown command\"}";
        }

        static void RunDaemon() {
            bool createdNew;
            using (Mutex mutex = new Mutex(true, "Global\\TeleTermConsoleBridgeMutex", out createdNew)) {
                if (!createdNew) {
                    WriteOutput("{\"error\":\"Daemon already running\"}");
                    return;
                }

                WriteOutput("{\"success\":true,\"message\":\"ConsoleBridge daemon listening on \\\\\\\\.\\\\pipe\\\\TeleTermConsoleBridge\"}");

                while (true) {
                    try {
                        using (var server = new NamedPipeServerStream(
                            "TeleTermConsoleBridge",
                            PipeDirection.InOut,
                            NamedPipeServerStream.MaxAllowedServerInstances,
                            PipeTransmissionMode.Byte,
                            PipeOptions.Asynchronous))
                        {
                            server.WaitForConnection();
                            using (var reader = new StreamReader(server, Encoding.UTF8))
                            using (var writer = new StreamWriter(server, Encoding.UTF8) { AutoFlush = true })
                            {
                                while (server.IsConnected) {
                                    string line = reader.ReadLine();
                                    if (line == null) break;
                                    string response = Execute(line);
                                    writer.WriteLine(response);
                                }
                            }
                        }
                    } catch {
                        Thread.Sleep(50);
                    }
                }
            }
        }

        static void RunKeepAlive() {
            uint flags = ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED;
            uint result = SetThreadExecutionState(flags);
            if (result == 0) {
                flags = ES_CONTINUOUS | ES_SYSTEM_REQUIRED;
                result = SetThreadExecutionState(flags);
            }
            WriteOutput(string.Format("{{\"success\":true,\"state\":{0},\"message\":\"System sleep prevented\"}}", result));
            
            while (true) {
                System.Threading.Thread.Sleep(30000);
                SetThreadExecutionState(flags);
            }
        }

        static string GetBufferInfo(uint pid) {
            FreeConsole();
            if (!AttachConsole(pid)) {
                return "{\"success\":false,\"error\":\"Attach failed\"}";
            }
            IntPtr hOut = CreateFile("CONOUT$", 0x80000000 | 0x40000000, 1 | 2, IntPtr.Zero, 3, 0, IntPtr.Zero);
            if (hOut == (IntPtr)(-1) || hOut == IntPtr.Zero) {
                FreeConsole();
                return "{\"success\":false,\"error\":\"Open CONOUT$ failed\"}";
            }
            CONSOLE_SCREEN_BUFFER_INFO csbi;
            if (!GetConsoleScreenBufferInfo(hOut, out csbi)) {
                CloseHandle(hOut);
                FreeConsole();
                return "{\"success\":false,\"error\":\"GetBufferInfo failed\"}";
            }
            CloseHandle(hOut);
            FreeConsole();
            return string.Format(
                "{{\"success\":true,\"dwSize\":{{\"x\":{0},\"y\":{1}}},\"cursor\":{{\"x\":{2},\"y\":{3}}},\"window\":{{\"left\":{4},\"top\":{5},\"right\":{6},\"bottom\":{7}}}}}",
                csbi.dwSize.X, csbi.dwSize.Y, csbi.dwCursorPosition.X, csbi.dwCursorPosition.Y,
                csbi.srWindow.Left, csbi.srWindow.Top, csbi.srWindow.Right, csbi.srWindow.Bottom
            );
        }

        static string ListProcesses() {
            var targetNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                "claude", "powershell", "pwsh", "cmd", "wsl", "bash", "node", "python", "git", "ssh"
            };

            int currentPid = Process.GetCurrentProcess().Id;
            var results = new List<string>();

            Process[] processes = Process.GetProcesses();
            foreach (var p in processes) {
                try {
                    if (p.Id == currentPid) continue;
                    if (!targetNames.Contains(p.ProcessName)) continue;

                    string preview = "";
                    bool hasConsole = false;

                    FreeConsole();
                    if (AttachConsole((uint)p.Id)) {
                        hasConsole = true;
                        IntPtr hOut = CreateFile("CONOUT$", 0x80000000 | 0x40000000, 1 | 2, IntPtr.Zero, 3, 0, IntPtr.Zero);
                        if (hOut != (IntPtr)(-1) && hOut != IntPtr.Zero) {
                            CONSOLE_SCREEN_BUFFER_INFO csbi;
                            if (GetConsoleScreenBufferInfo(hOut, out csbi)) {
                                int width = csbi.dwSize.X;
                                int cursorY = csbi.dwCursorPosition.Y;
                                int startY = Math.Max(0, cursorY - 4);
                                StringBuilder sb = new StringBuilder();
                                for (short y = (short)startY; y <= cursorY; y++) {
                                    StringBuilder line = new StringBuilder(width);
                                    CHAR_INFO[] row = new CHAR_INFO[width];
                                    COORD bSize = new COORD { X = (short)width, Y = 1 };
                                    COORD bCoord = new COORD { X = 0, Y = 0 };
                                    SMALL_RECT sRect = new SMALL_RECT { Left = 0, Top = y, Right = (short)(width - 1), Bottom = y };
                                    if (ReadConsoleOutput(hOut, row, bSize, bCoord, ref sRect)) {
                                        for (int i = 0; i < width; i++) {
                                            char ch = row[i].UnicodeChar;
                                            if (ch != '\0') line.Append(ch);
                                        }
                                        string s = line.ToString().Trim();
                                        if (!string.IsNullOrEmpty(s)) {
                                            if (sb.Length > 0) sb.Append(" ⏎ ");
                                            sb.Append(s);
                                        }
                                    }
                                }
                                preview = sb.ToString();
                                if (preview.Length > 150) preview = preview.Substring(0, 150) + "...";
                            }
                            CloseHandle(hOut);
                        }
                        FreeConsole();
                    }

                    long ramMb = p.WorkingSet64 / (1024 * 1024);
                    string title = p.MainWindowTitle;
                    if (string.IsNullOrEmpty(title)) title = p.ProcessName;

                    string jsonItem = string.Format(
                        "{{\"pid\":{0},\"name\":\"{1}\",\"title\":{2},\"ramMb\":{3},\"hasConsole\":{4},\"preview\":{5}}}",
                        p.Id,
                        EscapeJson(p.ProcessName),
                        QuoteJson(title),
                        ramMb,
                        hasConsole ? "true" : "false",
                        QuoteJson(preview)
                    );
                    results.Add(jsonItem);
                } catch {
                    // skip
                }
            }

            return "[" + string.Join(",", results.ToArray()) + "]";
        }

        static string GetAnsiScreen(uint pid) {
            FreeConsole();
            if (!AttachConsole(pid)) {
                return "{\"success\":false,\"error\":\"Attach failed\"}";
            }

            IntPtr hOut = CreateFile("CONOUT$", 0x80000000 | 0x40000000, 1 | 2, IntPtr.Zero, 3, 0, IntPtr.Zero);
            if (hOut == (IntPtr)(-1) || hOut == IntPtr.Zero) {
                FreeConsole();
                return "{\"success\":false,\"error\":\"Open CONOUT$ failed\"}";
            }

            CONSOLE_SCREEN_BUFFER_INFO csbi;
            if (!GetConsoleScreenBufferInfo(hOut, out csbi)) {
                CloseHandle(hOut);
                FreeConsole();
                return "{\"success\":false,\"error\":\"GetBufferInfo failed\"}";
            }

            short width = (short)(csbi.srWindow.Right - csbi.srWindow.Left + 1);
            short height = (short)(csbi.srWindow.Bottom - csbi.srWindow.Top + 1);
            CHAR_INFO[] buffer = new CHAR_INFO[width * height];
            COORD bufferSize = new COORD { X = width, Y = height };
            COORD bufferCoord = new COORD { X = 0, Y = 0 };
            SMALL_RECT readRegion = csbi.srWindow;

            ReadConsoleOutput(hOut, buffer, bufferSize, bufferCoord, ref readRegion);
            CloseHandle(hOut);
            FreeConsole();

            StringBuilder sb = new StringBuilder();
            
            // FLICKER-FREE: Ẩn con trỏ và đưa về (1,1)
            sb.Append("\x1b[?25l\x1b[H");

            int lastFg = -1;
            int lastBg = -1;

            for (int y = 0; y < height; y++) {
                sb.AppendFormat("\x1b[{0};1H", y + 1);

                int lastCharX = -1;
                for (int x = width - 1; x >= 0; x--) {
                    int idx = y * width + x;
                    char c = buffer[idx].UnicodeChar;
                    int bg = (buffer[idx].Attributes >> 4) & 0x0F;
                    if ((c != ' ' && c != '\0') || bg != 0) {
                        lastCharX = x;
                        break;
                    }
                }

                if (lastCharX >= 0) {
                    for (int x = 0; x <= lastCharX; x++) {
                        int idx = y * width + x;
                        char c = buffer[idx].UnicodeChar;
                        if (c == '\0') c = ' ';

                        int fg = buffer[idx].Attributes & 0x0F;
                        int bg = (buffer[idx].Attributes >> 4) & 0x0F;

                        if (fg != lastFg) {
                            sb.Append(FgAnsi[fg]);
                            lastFg = fg;
                        }
                        if (bg != lastBg) {
                            sb.Append(BgAnsi[bg]);
                            lastBg = bg;
                        }
                        sb.Append(c);
                    }
                }

                if (lastBg != 0) {
                    sb.Append("\x1b[49m");
                    lastBg = 0;
                }
                
                sb.Append("\x1b[K");
            }

            sb.Append("\x1b[0m");

            int curX = Math.Max(1, Math.Min((int)width, (int)csbi.dwCursorPosition.X + 1));
            int curY = Math.Max(1, Math.Min((int)height, (int)csbi.dwCursorPosition.Y - csbi.srWindow.Top + 1));
            sb.AppendFormat("\x1b[{0};{1}H\x1b[?25h", curY, curX);

            byte[] ansiBytes = Encoding.UTF8.GetBytes(sb.ToString());
            string ansiBase64 = Convert.ToBase64String(ansiBytes);

            StringBuilder plainText = new StringBuilder();
            for (int y = 0; y < height; y++) {
                int lastCharX = -1;
                for (int x = width - 1; x >= 0; x--) {
                    char c = buffer[y * width + x].UnicodeChar;
                    if (c != ' ' && c != '\0') {
                        lastCharX = x;
                        break;
                    }
                }
                if (lastCharX >= 0) {
                    for (int x = 0; x <= lastCharX; x++) {
                        char c = buffer[y * width + x].UnicodeChar;
                        plainText.Append(c == '\0' ? ' ' : c);
                    }
                }
                plainText.Append("\n");
            }
            string textBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(plainText.ToString()));

            return string.Format("{{\"success\":true,\"pid\":{0},\"cols\":{1},\"rows\":{2},\"cursorX\":{3},\"cursorY\":{4},\"ansiBase64\":\"{5}\",\"textBase64\":\"{6}\"}}",
                pid, width, height, csbi.dwCursorPosition.X, csbi.dwCursorPosition.Y, ansiBase64, textBase64);
        }

        static string GetProcessTree(uint rootPid) {
            IntPtr hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
            if (hSnapshot == IntPtr.Zero || hSnapshot == (IntPtr)(-1)) {
                return "[]";
            }

            var parentToChildren = new Dictionary<uint, List<uint>>();
            var pidToEntry = new Dictionary<uint, PROCESSENTRY32>();

            PROCESSENTRY32 pe = new PROCESSENTRY32();
            pe.dwSize = (uint)Marshal.SizeOf(typeof(PROCESSENTRY32));

            if (Process32First(hSnapshot, ref pe)) {
                do {
                    pidToEntry[pe.th32ProcessID] = pe;
                    if (!parentToChildren.ContainsKey(pe.th32ParentProcessID)) {
                        parentToChildren[pe.th32ParentProcessID] = new List<uint>();
                    }
                    parentToChildren[pe.th32ParentProcessID].Add(pe.th32ProcessID);
                } while (Process32Next(hSnapshot, ref pe));
            }
            CloseHandle(hSnapshot);

            // BFS traverse from rootPid
            var descendants = new List<uint>();
            var visited = new HashSet<uint>();
            var queue = new Queue<uint>();

            if (pidToEntry.ContainsKey(rootPid)) {
                queue.Enqueue(rootPid);
                visited.Add(rootPid);
            }

            while (queue.Count > 0) {
                uint current = queue.Dequeue();
                descendants.Add(current);
                if (parentToChildren.ContainsKey(current)) {
                    foreach (uint child in parentToChildren[current]) {
                        if (!visited.Contains(child)) {
                            visited.Add(child);
                            queue.Enqueue(child);
                        }
                    }
                }
            }

            var results = new List<string>();
            foreach (uint pid in descendants) {
                string name = "";
                uint ppid = 0;
                if (pidToEntry.ContainsKey(pid)) {
                    name = pidToEntry[pid].szExeFile;
                    ppid = pidToEntry[pid].th32ParentProcessID;
                }

                long ramMb = 0;
                try {
                    Process p = Process.GetProcessById((int)pid);
                    ramMb = p.WorkingSet64 / (1024 * 1024);
                } catch {
                    // process may have exited
                }

                results.Add(string.Format(
                    "{{\"pid\":{0},\"ppid\":{1},\"name\":{2},\"ramMb\":{3},\"cmd\":{4},\"isRoot\":{5}}}",
                    pid,
                    ppid,
                    QuoteJson(name),
                    ramMb,
                    QuoteJson(""),
                    pid == rootPid ? "true" : "false"
                ));
            }

            return "[" + string.Join(",", results.ToArray()) + "]";
        }

        static string WriteProcessInput(uint pid, string text) {
            FreeConsole();
            if (!AttachConsole(pid)) {
                return "{\"success\":false,\"error\":\"Attach failed\"}";
            }

            IntPtr hIn = CreateFile("CONIN$", 0x80000000 | 0x40000000, 1 | 2, IntPtr.Zero, 3, 0, IntPtr.Zero);
            if (hIn == (IntPtr)(-1) || hIn == IntPtr.Zero) {
                FreeConsole();
                return "{\"success\":false,\"error\":\"Open CONIN$ failed\"}";
            }

            List<INPUT_RECORD> records = new List<INPUT_RECORD>();
            int i = 0;
            while (i < text.Length) {
                // Kiểm tra chuỗi ESC VT (Arrow keys, Shift+Tab, v.v...)
                // Hỗ trợ cả ESC thật '\x1b' (độ dài 1) lẫn chuỗi escaped "\\x1b" (độ dài 4)
                bool isEsc = false;
                int prefixLen = 0;

                if (text[i] == '\x1b') {
                    isEsc = true;
                    prefixLen = 1;
                } else if (text[i] == '\\' && i + 3 < text.Length && text[i + 1] == 'x' && text[i + 2] == '1' && (text[i + 3] == 'b' || text[i + 3] == 'B')) {
                    isEsc = true;
                    prefixLen = 4;
                }

                if (isEsc) {
                    int nextIdx = i + prefixLen;
                    if (nextIdx < text.Length) {
                        char bracket = text[nextIdx];
                        if (bracket == '[' || bracket == 'O') {
                            if (nextIdx + 1 < text.Length) {
                                char code = text[nextIdx + 1];
                                ushort vk = 0;
                                bool enhanced = true;
                                uint ctrlState = 0;
                                int advance = prefixLen + 2;

                                if (code == 'A') { vk = 0x26; } // UP ARROW (VK_UP)
                                else if (code == 'B') { vk = 0x28; } // DOWN ARROW (VK_DOWN)
                                else if (code == 'C') { vk = 0x27; } // RIGHT ARROW (VK_RIGHT)
                                else if (code == 'D') { vk = 0x25; } // LEFT ARROW (VK_LEFT)
                                else if (code == 'H') { vk = 0x24; } // HOME
                                else if (code == 'F') { vk = 0x23; } // END
                                else if (code == 'Z') { vk = 0x09; ctrlState = 0x0010; enhanced = false; } // Shift+Tab
                                else if (code == '5' && nextIdx + 2 < text.Length && text[nextIdx + 2] == '~') { vk = 0x21; advance = prefixLen + 3; } // PageUp
                                else if (code == '6' && nextIdx + 2 < text.Length && text[nextIdx + 2] == '~') { vk = 0x22; advance = prefixLen + 3; } // PageDown
                                else if (code == '3' && nextIdx + 2 < text.Length && text[nextIdx + 2] == '~') { vk = 0x2E; advance = prefixLen + 3; } // Delete
                                else if (code == '2' && nextIdx + 2 < text.Length && text[nextIdx + 2] == '~') { vk = 0x2D; advance = prefixLen + 3; } // Insert

                                if (vk != 0) {
                                    ushort sc = (ushort)MapVirtualKey(vk, 0);
                                    AddKeyRecord(records, vk, sc, '\0', (enhanced ? 0x0100u : 0u) | ctrlState);
                                    i += advance;
                                    continue;
                                }
                            }
                        }
                    }

                    // Standalone ESC
                    ushort escSc = (ushort)MapVirtualKey(0x1B, 0);
                    AddKeyRecord(records, 0x1B, escSc, '\x1b', 0);
                    i += prefixLen;
                    continue;
                }

                char c = text[i];
                if (c == '\x03') { // Ctrl+C
                    ushort sc = (ushort)MapVirtualKey(0x43, 0);
                    AddKeyRecord(records, 0x43, sc, '\x03', 0x0008);
                } else if (c == '\x14') { // Ctrl+T
                    ushort sc = (ushort)MapVirtualKey(0x54, 0);
                    AddKeyRecord(records, 0x54, sc, '\x14', 0x0008);
                } else if (c == '\r' || c == '\n') {
                    ushort sc = (ushort)MapVirtualKey(0x0D, 0);
                    AddKeyRecord(records, 0x0D, sc, '\r', 0);
                } else if (c == '\t') {
                    ushort sc = (ushort)MapVirtualKey(0x09, 0);
                    AddKeyRecord(records, 0x09, sc, '\t', 0);
                } else if (c == '\b' || c == 0x7F) {
                    ushort sc = (ushort)MapVirtualKey(0x08, 0);
                    AddKeyRecord(records, 0x08, sc, '\b', 0);
                } else {
                    short vkScan = VkKeyScan(c);
                    ushort vk = (ushort)(vkScan & 0xFF);
                    uint ctrl = 0;
                    if ((vkScan & 0x0100) != 0) ctrl |= 0x0010; // SHIFT
                    if ((vkScan & 0x0200) != 0) ctrl |= 0x0008; // CTRL
                    if ((vkScan & 0x0400) != 0) ctrl |= 0x0002; // ALT
                    ushort sc = (ushort)MapVirtualKey(vk, 0);
                    AddKeyRecord(records, vk, sc, c, ctrl);
                }
                i++;
            }

            uint written;
            bool ok = WriteConsoleInput(hIn, records.ToArray(), (uint)records.Count, out written);

            CloseHandle(hIn);
            FreeConsole();

            return string.Format("{{\"success\":{0},\"count\":{1}}}", ok ? "true" : "false", written);
        }

        static void AddKeyRecord(List<INPUT_RECORD> records, ushort vk, ushort scanCode, char ch, uint ctrlState) {
            INPUT_RECORD down = new INPUT_RECORD();
            down.EventType = 1;
            down.KeyEvent.bKeyDown = 1;
            down.KeyEvent.wRepeatCount = 1;
            down.KeyEvent.wVirtualKeyCode = vk;
            down.KeyEvent.wVirtualScanCode = scanCode;
            down.KeyEvent.UnicodeChar = ch;
            down.KeyEvent.dwControlKeyState = ctrlState;
            records.Add(down);

            INPUT_RECORD up = new INPUT_RECORD();
            up.EventType = 1;
            up.KeyEvent.bKeyDown = 0;
            up.KeyEvent.wRepeatCount = 1;
            up.KeyEvent.wVirtualKeyCode = vk;
            up.KeyEvent.wVirtualScanCode = scanCode;
            up.KeyEvent.UnicodeChar = ch;
            up.KeyEvent.dwControlKeyState = ctrlState;
            records.Add(up);
        }

        static string EscapeJson(string s) {
            if (s == null) return "";
            StringBuilder sb = new StringBuilder();
            foreach (char c in s) {
                if (c == '\\') sb.Append("\\\\");
                else if (c == '\"') sb.Append("\\\"");
                else if (c == '\r') {}
                else if (c == '\n') sb.Append("\\n");
                else if (c == '\t') sb.Append("\\t");
                else if (c < 32 || (c > 126 && c < 160)) {
                    sb.AppendFormat("\\u{0:x4}", (int)c);
                } else {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }

        static string QuoteJson(string s) {
            return "\"" + EscapeJson(s) + "\"";
        }
    }
}
