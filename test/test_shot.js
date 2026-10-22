const { exec } = require('child_process');

const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$ms = New-Object System.IO.MemoryStream
$bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$base64 = [Convert]::ToBase64String($ms.ToArray())
$graphics.Dispose()
$bitmap.Dispose()
$ms.Dispose()
[Console]::Out.WriteLine("WIDTH:" + $bounds.Width)
[Console]::Out.WriteLine("HEIGHT:" + $bounds.Height)
[Console]::Out.WriteLine("DATA:" + $base64)
`;

const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
exec(`powershell.exe -NoProfile -NonInteractive -EncodedCommand ${encoded}`, { maxBuffer: 15 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
        console.error('ERROR:', err);
        return;
    }
    const lines = stdout.split(/\r?\n/);
    let width = 0, height = 0, data = '';
    for (const line of lines) {
        if (line.startsWith('WIDTH:')) width = parseInt(line.substring(6), 10);
        else if (line.startsWith('HEIGHT:')) height = parseInt(line.substring(7), 10);
        else if (line.startsWith('DATA:')) data = line.substring(5);
    }
    console.log('SUCCESS! Width:', width, 'Height:', height, 'Data length:', data.length);
});
