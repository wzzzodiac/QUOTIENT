@echo off
setlocal
set "CALC_FILE=%~dp0index.html"
if not exist "%CALC_FILE%" (
  echo Cannot find index.html. Keep this launcher inside the project folder.
  pause
  exit /b 1
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%CALC_FILE%"
  exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "%CALC_FILE%"
  exit /b 0
)
if exist "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe" "%CALC_FILE%"
  exit /b 0
)
start "" "%CALC_FILE%"
