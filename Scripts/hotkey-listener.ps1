# Low-level keyboard hook via SetWindowsHookEx + WH_KEYBOARD_LL
# Emits raw key codes to stdout as KEY:{vkCode} when Ctrl+Shift+<key> is pressed.
# Works even when a DirectX game (DCS World) has focus.
# Command mapping is handled by the Electron main process.

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Diagnostics;

public class LowLevelKeyboardHook {
    private delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll")]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll")]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public POINT pt;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT {
        public int x;
        public int y;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct KBDLLHOOKSTRUCT {
        public uint vkCode;
        public uint scanCode;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int VK_CONTROL = 0x11;
    private const int VK_SHIFT   = 0x10;

    private static IntPtr hookId = IntPtr.Zero;
    private static HookProc hookProc;

    private static void Emit(string command) {
        Console.WriteLine(command);
        Console.Out.Flush();
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && (int)wParam == WM_KEYDOWN) {
            bool ctrl  = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
            bool shift = (GetAsyncKeyState(VK_SHIFT)   & 0x8000) != 0;

            if (ctrl && shift) {
                KBDLLHOOKSTRUCT kbd = Marshal.PtrToStructure<KBDLLHOOKSTRUCT>(lParam);
                Emit("KEY:" + kbd.vkCode);
            }
        }
        return CallNextHookEx(hookId, nCode, wParam, lParam);
    }

    public static void Run() {
        hookProc = HookCallback;
        using (var proc = Process.GetCurrentProcess())
        using (var mod = proc.MainModule) {
            hookId = SetWindowsHookEx(WH_KEYBOARD_LL, hookProc, GetModuleHandle(mod.ModuleName), 0);
        }

        if (hookId == IntPtr.Zero) {
            Console.Error.WriteLine("Failed to install hook. Error: " + Marshal.GetLastWin32Error());
            return;
        }

        Console.WriteLine("HOOK_READY");
        Console.Out.Flush();

        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0)) {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }

        UnhookWindowsHookEx(hookId);
    }
}
"@

[LowLevelKeyboardHook]::Run()
