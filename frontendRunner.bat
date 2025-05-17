@echo off
cd frontend

REM Instalar dependencias
call npm install

REM Ejecutar frontend y guardar log
call npm run dev > frontend-log.txt 2>&1

REM Espera 2 segundos
timeout /t 2 >nul

REM Verificar si hubo errores
findstr /i "Error" frontend-log.txt >nul
if %errorlevel% equ 0 (
    echo Error detectado en frontend, la consola permanecerá abierta.
    pause
) else (
    exit
)
