If ((Get-Service -Name "ShareMyFiles" -ErrorAction "Ignore") -Eq $Null) {
    Write-Host "Service ShareMyFiles is not installed."
    Return
}

Stop-Service -Name "ShareMyFiles" -Force

While ((Get-Service -Name "ShareMyFiles").Status -Eq "Running") {
    Start-Sleep 2
}

Remove-Item "$PSScriptRoot\daemon" -Force -Recurse

$Service = Get-WmiObject -Class Win32_Service -Filter "Name='sharemyfiles.exe'"
$Service.Delete() | Out-Null