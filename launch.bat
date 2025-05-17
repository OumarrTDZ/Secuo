@echo off
title Secuo Project Launcher
echo === Iniciando Secuo Project ===

REM 1. Verificar y liberar puerto 5000 si está en uso
FOR /F "tokens=5" %%P IN ('netstat -aon ^| find ":5000" ^| find "LISTENING"') DO (
    echo Puerto 5000 en uso por PID %%P
    echo Terminando proceso...
    taskkill /F /PID %%P >nul
)

REM 2. Lanzar backend y frontend en ventanas separadas
start "Backend" backendRunner.bat
start "Frontend" frontendRunner.bat

REM 3. Esperar unos segundos y abrir la web
timeout /t 3 >nul
start http://localhost:5173

echo === Backend y frontend iniciados ===
pause
