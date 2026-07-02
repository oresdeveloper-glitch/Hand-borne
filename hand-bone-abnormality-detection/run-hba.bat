@echo off
title HBA App
cd /d "C:\Users\LETFIX\Downloads\hand-bone-abnormality-detection (2)\hand-bone-abnormality-detection"
echo Starting HBA - Hand Bone Abnormality Detection
echo.
echo [1/2] Starting email server...
start "HBA-Email" /B node email-server.mjs
timeout /t 3 /nobreak >nul
echo [2/2] Starting Vite frontend...
echo.
echo App: http://localhost:5173
echo.
npm run dev
pause
