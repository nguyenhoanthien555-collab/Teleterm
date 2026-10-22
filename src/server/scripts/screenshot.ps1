param(
    [string]$Format = "jpg",
    [int]$Quality = 82,
    [int]$MaxWidth = 1920
)

$code = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;

public class NativeScreenCapture {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenInputDesktop(uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetThreadDesktop(IntPtr hDesktop);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool CloseDesktop(IntPtr hDesktop);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr GetDesktopWindow();

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr GetDC(IntPtr hwnd);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern int ReleaseDC(IntPtr hwnd, IntPtr hdc);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern IntPtr CreateCompatibleDC(IntPtr hdc);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern IntPtr CreateCompatibleBitmap(IntPtr hdc, int nWidth, int nHeight);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern IntPtr SelectObject(IntPtr hdc, IntPtr hgdiobj);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool DeleteObject(IntPtr hObject);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool DeleteDC(IntPtr hdc);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool BitBlt(IntPtr hdcDest, int nXDest, int nYDest, int nWidth, int nHeight, IntPtr hdcSrc, int nXSrc, int nYSrc, int dwRop);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);

    [DllImport("user32.dll")]
    public static extern int SendMessage(IntPtr hWnd, int hMsg, int wParam, int lParam);

    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    public static extern bool GetCursorInfo(out CURSORINFO pci);

    [DllImport("user32.dll")]
    public static extern bool DrawIcon(IntPtr hDC, int X, int Y, IntPtr hIcon);

    [DllImport("user32.dll")]
    public static extern bool GetIconInfo(IntPtr hIcon, out ICONINFO piconinfo);

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT { public int x; public int y; }

    [StructLayout(LayoutKind.Sequential)]
    public struct CURSORINFO {
        public int cbSize;
        public int flags;
        public IntPtr hCursor;
        public POINT ptScreenPos;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct ICONINFO {
        public bool fIcon;
        public int xHotspot;
        public int yHotspot;
        public IntPtr hbmMask;
        public IntPtr hbmColor;
    }

    public const int SRCCOPY = 0x00CC0020;
    public const int CAPTUREBLT = 0x40000000;
    public const int CURSOR_SHOWING = 0x00000001;
    public const int WM_SYSCOMMAND = 0x0112;
    public const int SC_MONITORPOWER = 0xF170;
    public const uint MOUSEEVENTF_MOVE = 0x0001;

    public static void WakeMonitor() {
        try {
            // Wake monitor if it was turned off or in standby
            SendMessage(new IntPtr(-1), WM_SYSCOMMAND, SC_MONITORPOWER, -1);
            mouse_event(MOUSEEVENTF_MOVE, 0, 1, 0, UIntPtr.Zero);
            mouse_event(MOUSEEVENTF_MOVE, 0, 0, 0, UIntPtr.Zero);
        } catch {}
    }

    public static string Capture(string format, int quality, int maxWidth, out int outW, out int outH) {
        string b64 = null;
        int finalW = 0;
        int finalH = 0;
        Exception error = null;

        Thread t = new Thread(() => {
            IntPtr hDesktop = IntPtr.Zero;
            try {
                // Must attach to active input desktop FIRST before touching any window/GDI APIs
                hDesktop = OpenInputDesktop(0, false, 0x01FF);
                if (hDesktop == IntPtr.Zero) {
                    hDesktop = OpenDesktop("Default", 0, false, 0x01FF);
                }
                if (hDesktop != IntPtr.Zero) {
                    SetThreadDesktop(hDesktop);
                }

                int screenW = GetSystemMetrics(0); // SM_CXSCREEN
                int screenH = GetSystemMetrics(1); // SM_CYSCREEN
                if (screenW <= 0) screenW = 1920;
                if (screenH <= 0) screenH = 1080;

                IntPtr hDeskWnd = GetDesktopWindow();
                IntPtr hSrcDC = GetDC(hDeskWnd);
                if (hSrcDC == IntPtr.Zero) hSrcDC = GetDC(IntPtr.Zero);

                IntPtr hMemDC = CreateCompatibleDC(hSrcDC);
                IntPtr hBitmap = CreateCompatibleBitmap(hSrcDC, screenW, screenH);
                IntPtr hOldBmp = SelectObject(hMemDC, hBitmap);

                BitBlt(hMemDC, 0, 0, screenW, screenH, hSrcDC, 0, 0, SRCCOPY | CAPTUREBLT);

                // Draw Cursor
                try {
                    CURSORINFO ci = new CURSORINFO();
                    ci.cbSize = Marshal.SizeOf(typeof(CURSORINFO));
                    if (GetCursorInfo(out ci) && ci.flags == CURSOR_SHOWING && ci.hCursor != IntPtr.Zero) {
                        ICONINFO ii;
                        if (GetIconInfo(ci.hCursor, out ii)) {
                            DrawIcon(hMemDC, ci.ptScreenPos.x - ii.xHotspot, ci.ptScreenPos.y - ii.yHotspot, ci.hCursor);
                            if (ii.hbmColor != IntPtr.Zero) DeleteObject(ii.hbmColor);
                            if (ii.hbmMask != IntPtr.Zero) DeleteObject(ii.hbmMask);
                        }
                    }
                } catch {}

                SelectObject(hMemDC, hOldBmp);

                using (Bitmap rawBmp = Image.FromHbitmap(hBitmap)) {
                    Bitmap bmpToSave = rawBmp;
                    bool isResized = false;

                    if (maxWidth > 0 && screenW > maxWidth) {
                        int targetW = maxWidth;
                        int targetH = (int)((long)screenH * maxWidth / screenW);
                        bmpToSave = new Bitmap(targetW, targetH, PixelFormat.Format24bppRgb);
                        using (Graphics g = Graphics.FromImage(bmpToSave)) {
                            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                            g.DrawImage(rawBmp, 0, 0, targetW, targetH);
                        }
                        isResized = true;
                    }

                    finalW = bmpToSave.Width;
                    finalH = bmpToSave.Height;

                    using (MemoryStream ms = new MemoryStream()) {
                        if (format.ToLower() == "png") {
                            bmpToSave.Save(ms, ImageFormat.Png);
                        } else {
                            ImageCodecInfo jpgEncoder = null;
                            foreach (ImageCodecInfo codec in ImageCodecInfo.GetImageDecoders()) {
                                if (codec.FormatID == ImageFormat.Jpeg.Guid) {
                                    jpgEncoder = codec;
                                    break;
                                }
                            }
                            EncoderParameters eps = new EncoderParameters(1);
                            eps.Param[0] = new EncoderParameter(Encoder.Quality, (long)Math.Max(10, Math.Min(100, quality)));
                            bmpToSave.Save(ms, jpgEncoder, eps);
                        }
                        b64 = Convert.ToBase64String(ms.ToArray());
                    }

                    if (isResized) bmpToSave.Dispose();
                }

                DeleteObject(hBitmap);
                DeleteDC(hMemDC);
                ReleaseDC(hDeskWnd, hSrcDC);
            } catch (Exception ex) {
                error = ex;
            } finally {
                if (hDesktop != IntPtr.Zero) CloseDesktop(hDesktop);
            }
        });

        t.SetApartmentState(ApartmentState.STA);
        t.Start();
        t.Join(4000);

        if (error != null) throw error;
        outW = finalW;
        outH = finalH;
        return b64;
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

# Wake display if needed before spawning capture thread
[NativeScreenCapture]::WakeMonitor()

$w = 0
$h = 0
try {
    $base64 = [NativeScreenCapture]::Capture($Format, $Quality, $MaxWidth, [ref]$w, [ref]$h)
    Write-Output "WIDTH:$w"
    Write-Output "HEIGHT:$h"
    Write-Output "DATA:$base64"
} catch {
    [Console]::Error.WriteLine("ERROR:" + $_.Exception.ToString())
    exit 1
}
