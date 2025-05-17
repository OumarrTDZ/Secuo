@echo off
cd backend

REM Instalar dependencias
call npm install

REM Ejecutar seedData (Carga de base de datos MONGO ATLAS)
call node seedData.js

REM Ejecutar backend y guardar log
call npm run dev > backend-log.txt 2>&1

REM Espera 2 segundos
timeout /t 2 >nul

REM Verificar si hubo errores
findstr /i "Error" backend-log.txt >nul
if %errorlevel% equ 0 (
    echo Error detectado en backend, la consola permanecerá abierta.
    pause
) else (
    exit
)
