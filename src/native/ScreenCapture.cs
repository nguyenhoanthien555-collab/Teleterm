using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;

namespace TeleTerm {
    public class ScreenCapture {
        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr OpenInputDesktop(uint dwFlags, bool fInherit, uint dwDesiredAccess);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool SetThreadDesktop(IntPtr hDesktop);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool CloseDesktop(IntPtr hDesktop);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr GetDesktopWindow();

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr GetDC(IntPtr hwnd);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern int ReleaseDC(IntPtr hwnd, IntPtr hdc);

        [DllImport("gdi32.dll", SetLastError = true)]
        private static extern IntPtr CreateCompatibleDC(IntPtr hdc);

        [DllImport("gdi32.dll", SetLastError = true)]
        private static extern IntPtr CreateCompatibleBitmap(IntPtr hdc, int nWidth, int nHeight);

        [DllImport("gdi32.dll", SetLastError = true)]
        private static extern IntPtr SelectObject(IntPtr hdc, IntPtr hgdiobj);

        [DllImport("gdi32.dll", SetLastError = true)]
        private static extern bool DeleteObject(IntPtr hObject);

        [DllImport("gdi32.dll", SetLastError = true)]
        private static extern bool DeleteDC(IntPtr hdc);

        [DllImport("gdi32.dll", SetLastError = true)]
        private static extern bool BitBlt(IntPtr hdcDest, int nXDest, int nYDest, int nWidth, int nHeight, IntPtr hdcSrc, int nXSrc, int nYSrc, int dwRop);

        [DllImport("user32.dll")]
        private static extern int GetSystemMetrics(int nIndex);

        private const int SRCCOPY = 0x00CC0020;
        private const int CAPTUREBLT = 0x40000000;

        public static int Main(string[] args) {
            string base64Result = null;
            int outWidth = 0;
            int outHeight = 0;

            Thread worker = new Thread(() => {
                IntPtr hDesktop = IntPtr.Zero;
                try {
                    hDesktop = OpenInputDesktop(0, false, 0x01FF);
                    int errDesk = Marshal.GetLastWin32Error();
                    Console.Error.WriteLine("OpenInputDesktop: " + hDesktop + ", err=" + errDesk);

                    if (hDesktop != IntPtr.Zero) {
                        bool setDesk = SetThreadDesktop(hDesktop);
                        Console.Error.WriteLine("SetThreadDesktop: " + setDesk + ", err=" + Marshal.GetLastWin32Error());
                    }

                    int w = GetSystemMetrics(0);
                    int h = GetSystemMetrics(1);
                    Console.Error.WriteLine("Screen metrics: " + w + "x" + h);

                    IntPtr hDeskWnd = GetDesktopWindow();
                    IntPtr hSrcDC = GetDC(hDeskWnd);
                    Console.Error.WriteLine("GetDC: " + hSrcDC);

                    IntPtr hMemDC = CreateCompatibleDC(hSrcDC);
                    IntPtr hBitmap = CreateCompatibleBitmap(hSrcDC, w, h);
                    IntPtr hOldBmp = SelectObject(hMemDC, hBitmap);

                    bool blt = BitBlt(hMemDC, 0, 0, w, h, hSrcDC, 0, 0, SRCCOPY | CAPTUREBLT);
                    Console.Error.WriteLine("BitBlt: " + blt + ", err=" + Marshal.GetLastWin32Error());

                    SelectObject(hMemDC, hOldBmp);

                    using (Bitmap bmp = Image.FromHbitmap(hBitmap)) {
                        outWidth = bmp.Width;
                        outHeight = bmp.Height;
                        Color p = bmp.GetPixel(w / 2, h / 2);
                        Console.Error.WriteLine("Sample pixel: " + p);

                        using (MemoryStream ms = new MemoryStream()) {
                            bmp.Save(ms, ImageFormat.Jpeg);
                            base64Result = Convert.ToBase64String(ms.ToArray());
                        }
                    }

                    DeleteObject(hBitmap);
                    DeleteDC(hMemDC);
                    ReleaseDC(hDeskWnd, hSrcDC);
                } catch (Exception ex) {
                    Console.Error.WriteLine("Exception: " + ex);
                } finally {
                    if (hDesktop != IntPtr.Zero) CloseDesktop(hDesktop);
                }
            });

            worker.SetApartmentState(ApartmentState.STA);
            worker.Start();
            worker.Join();

            if (string.IsNullOrEmpty(base64Result)) return 1;

            Console.WriteLine("WIDTH:" + outWidth);
            Console.WriteLine("HEIGHT:" + outHeight);
            Console.WriteLine("MIME:image/jpeg");
            Console.WriteLine("DATA:" + base64Result);
            return 0;
        }
    }
}
