Write-Output "[Docker] Compose Up"
Start-Process -FilePath "bun.exe"  -ArgumentList "db:up"

Write-Output "[Servidor] Iniciando..."
Start-Process -FilePath "bun.exe"  -ArgumentList "run dev"

Write-Output "[Proxy] Iniciando..."
Start-Process -FilePath "mitmproxy.exe"  -ArgumentList "-s intercept.py" -Wait -WindowStyle Maximized