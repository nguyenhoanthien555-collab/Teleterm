param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Action,

    [Parameter(Position=1)]
    [string]$Target = "gemini:antigravity",

    [Parameter(Position=2)]
    [string]$Username = "antigravity",

    [Parameter(Position=3)]
    [string]$SecretBase64 = ""
)

$ProgressPreference = 'SilentlyContinue'

$definition = @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WinCredHelper {
    [DllImport("Advapi32.dll", SetLastError = true, EntryPoint = "CredReadW", CharSet = CharSet.Unicode)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

    [DllImport("Advapi32.dll", SetLastError = true, EntryPoint = "CredWriteW", CharSet = CharSet.Unicode)]
    public static extern bool CredWrite([In] ref CREDENTIAL userCredential, [In] uint flags);

    [DllImport("Advapi32.dll", SetLastError = true, EntryPoint = "CredDeleteW", CharSet = CharSet.Unicode)]
    public static extern bool CredDelete(string target, int type, int flags);

    [DllImport("Advapi32.dll", SetLastError = true)]
    public static extern void CredFree([In] IntPtr cred);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static string Read(string target) {
        IntPtr credPtr;
        if (CredRead(target, 1, 0, out credPtr)) {
            try {
                CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
                byte[] blob = new byte[cred.CredentialBlobSize];
                Marshal.Copy(cred.CredentialBlob, blob, 0, cred.CredentialBlobSize);
                return Encoding.UTF8.GetString(blob);
            } finally {
                CredFree(credPtr);
            }
        }
        return "";
    }

    public static bool Write(string target, string username, string secret) {
        byte[] blob = Encoding.UTF8.GetBytes(secret);
        IntPtr blobPtr = Marshal.AllocHGlobal(blob.Length);
        try {
            Marshal.Copy(blob, 0, blobPtr, blob.Length);
            CREDENTIAL cred = new CREDENTIAL();
            cred.Flags = 0;
            cred.Type = 1;
            cred.TargetName = target;
            cred.Comment = null;
            cred.CredentialBlobSize = blob.Length;
            cred.CredentialBlob = blobPtr;
            cred.Persist = 2;
            cred.AttributeCount = 0;
            cred.Attributes = IntPtr.Zero;
            cred.TargetAlias = null;
            cred.UserName = username;

            return CredWrite(ref cred, 0);
        } finally {
            Marshal.FreeHGlobal(blobPtr);
        }
    }

    public static bool Delete(string target) {
        return CredDelete(target, 1, 0);
    }
}
"@

Add-Type -TypeDefinition $definition -ErrorAction SilentlyContinue

switch ($Action.ToLower()) {
    "read" {
        $res = [WinCredHelper]::Read($Target)
        if ($res) {
            [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($res))
        }
    }
    "write" {
        if (-not $SecretBase64) {
            Write-Output "ERROR: SecretBase64 is required"
            exit 1
        }
        $rawBytes = [Convert]::FromBase64String($SecretBase64)
        $secretStr = [Text.Encoding]::UTF8.GetString($rawBytes)
        $ok = [WinCredHelper]::Write($Target, $Username, $secretStr)
        Write-Output $ok
    }
    "delete" {
        $ok = [WinCredHelper]::Delete($Target)
        Write-Output $ok
    }
    default {
        Write-Output "ERROR: Unknown action"
        exit 1
    }
}
