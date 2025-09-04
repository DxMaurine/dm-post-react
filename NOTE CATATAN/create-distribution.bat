@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo     DM POS REACT - AUTO DISTRIBUTION CREATOR
echo ====================================================
echo.

REM Auto-detect 7-Zip installation paths
set "SEVENZIP_PATH="
for %%P in (
    "C:\Program Files\7-Zip\7z.exe"
    "C:\Program Files (x86)\7-Zip\7z.exe"
    "%ProgramFiles%\7-Zip\7z.exe"
    "%ProgramFiles(x86)%\7-Zip\7z.exe"
    "C:\Tools\7-Zip\7z.exe"
) do (
    if exist "%%P" (
        set "SEVENZIP_PATH=%%P"
        goto :found_7zip
    )
)

echo [WARNING] 7-Zip not found in standard locations!
echo Trying to auto-download 7-Zip...
call :auto_install_7zip
if errorlevel 1 (
    echo ERROR: Failed to setup 7-Zip
    echo Please install manually from: https://www.7-zip.org/
    timeout /t 10 /nobreak >nul
    exit /b 1
)

:found_7zip
echo [✓] Found 7-Zip: !SEVENZIP_PATH!

REM Auto-detect latest installer version
set "INSTALLER_FILE="
for /f "delims=" %%F in ('dir "release\DM POS React Setup*.exe" /b /o:-d 2^>nul') do (
    if "!INSTALLER_FILE!"=="" set "INSTALLER_FILE=%%F"
)

if "!INSTALLER_FILE!"=="" (
    echo [ERROR] No installer found in release folder!
    echo Please build the application first with: npm run build:electron
    timeout /t 5 /nobreak >nul
    exit /b 1
)

echo [✓] Found installer: !INSTALLER_FILE!

REM Create distribution directory
if exist "distribution" rmdir /s /q "distribution"
mkdir "distribution"

echo [1/5] Copying installer files...
copy "release\!INSTALLER_FILE!" "distribution\"

REM Auto-create README if missing
if not exist "release\README.txt" call :create_auto_readme
copy "release\README.txt" "distribution\" 2>nul || echo [INFO] README.txt not found, will create one

echo [2/5] Copying documentation...
if exist "NOTE CATATAN\PANDUAN_INSTALASI_CLIENT.md" (
    copy "NOTE CATATAN\PANDUAN_INSTALASI_CLIENT.md" "distribution\"
    echo [✓] Installation guide copied
) else (
    echo [WARNING] Installation guide not found, creating basic one...
    call :create_basic_guide
)

if exist "NOTE CATATAN\CATATAN_DISTRIBUSI_PAK_PICCA.md" (
    copy "NOTE CATATAN\CATATAN_DISTRIBUSI_PAK_PICCA.md" "distribution\"
    echo [✓] Distribution notes copied
) else (
    echo [INFO] Distribution notes not found, skipping...
)

echo [3/5] Creating MySQL installer guide...
echo ====================================================  > "distribution\MYSQL_INSTALLER.txt"
echo     MYSQL INSTALLATION GUIDE                           >> "distribution\MYSQL_INSTALLER.txt"
echo ====================================================  >> "distribution\MYSQL_INSTALLER.txt"
echo.                                                       >> "distribution\MYSQL_INSTALLER.txt"
echo Download MySQL Community Server:                       >> "distribution\MYSQL_INSTALLER.txt"
echo https://dev.mysql.com/downloads/mysql/                >> "distribution\MYSQL_INSTALLER.txt"
echo.                                                       >> "distribution\MYSQL_INSTALLER.txt"
echo QUICK SETUP:                                           >> "distribution\MYSQL_INSTALLER.txt"
echo 1. Install MySQL Server                               >> "distribution\MYSQL_INSTALLER.txt"
echo 2. Set root password: 1234                            >> "distribution\MYSQL_INSTALLER.txt"
echo 3. Open MySQL Command Line                            >> "distribution\MYSQL_INSTALLER.txt"
echo 4. Run: CREATE DATABASE pos_db;                       >> "distribution\MYSQL_INSTALLER.txt"
echo 5. Install DM POS React                               >> "distribution\MYSQL_INSTALLER.txt"
echo ====================================================  >> "distribution\MYSQL_INSTALLER.txt"

echo [4/5] Auto-generating version info...
REM Extract version from package.json
for /f "tokens=2 delims=\"" %%V in ('findstr "version" package.json 2^>nul') do set "APP_VERSION=%%V"
if "!APP_VERSION!"=="" set "APP_VERSION=1.4.7"
echo [✓] Detected version: !APP_VERSION!

echo [5/5] Creating self-extracting archive...

REM Create SFX config with dynamic version
echo ;The comment below contains SFX script commands > "sfx_config.txt"
echo Title="DM POS React v!APP_VERSION! - Installation Package" >> "sfx_config.txt"
echo BeginPrompt="Ini akan mengextract DM POS React installer dan dokumentasi.`nLanjutkan?" >> "sfx_config.txt"
echo RunProgram="README.txt" >> "sfx_config.txt"
echo Directory="%%T\DM_POS_React_v!APP_VERSION!" >> "sfx_config.txt"

REM Create the SFX with dynamic naming
set "DIST_NAME=DM_POS_React_v!APP_VERSION!_Distribution.exe"
"!SEVENZIP_PATH!" a -sfx7z.sfx "!DIST_NAME!" "distribution\*" -mx9

if !errorlevel! equ 0 (
    echo [✓] Archive created successfully!
) else (
    echo [✗] Failed to create archive
    goto :cleanup_and_exit
)

REM Cleanup
del "sfx_config.txt"
rmdir /s /q "distribution"

echo.
echo ====================================================
echo SUCCESS! Distribution package created:
echo "!DIST_NAME!"
echo Size: 
for %%A in ("!DIST_NAME!") do echo %%~zA bytes
echo.
echo File ini berisi:
echo - !INSTALLER_FILE!
echo - README.txt (quick guide)
echo - PANDUAN_INSTALASI_CLIENT.md
echo - MYSQL_INSTALLER.txt
echo - CATATAN_DISTRIBUSI_PAK_PICCA.md
echo ====================================================
echo.
echo [INFO] Distribution ready for deployment!
echo [INFO] You can now share: !DIST_NAME!
echo.
echo Auto-closing in 10 seconds...
timeout /t 10 /nobreak >nul
goto :eof

REM === HELPER FUNCTIONS ===

:auto_install_7zip
echo [INFO] Attempting to download 7-Zip portable...
if not exist "temp" mkdir "temp"
powershell -Command "& {try {Invoke-WebRequest -Uri 'https://www.7-zip.org/a/7za.exe' -OutFile 'temp\7za.exe'; exit 0} catch {exit 1}}"
if exist "temp\7za.exe" (
    set "SEVENZIP_PATH=temp\7za.exe"
    echo [✓] 7-Zip portable downloaded
    exit /b 0
) else (
    exit /b 1
)

:create_auto_readme
echo Creating auto README... > "release\README.txt"
echo ================================== >> "release\README.txt"
echo    DM POS REACT - QUICK START >> "release\README.txt"
echo ================================== >> "release\README.txt"
echo. >> "release\README.txt"
echo 1. Install MySQL Server >> "release\README.txt"
echo 2. Run installer >> "release\README.txt"
echo 3. Follow setup wizard >> "release\README.txt"
echo. >> "release\README.txt"
echo For detailed instructions, see: >> "release\README.txt"
echo PANDUAN_INSTALASI_CLIENT.md >> "release\README.txt"
echo ================================== >> "release\README.txt"
exit /b 0

:create_basic_guide
echo # DM POS React - Installation Guide > "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo. >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo ## System Requirements >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo - Windows 7/8/10/11 (64-bit) >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo - MySQL Server 5.7+ or 8.0+ >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo - 4GB RAM minimum >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo. >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo ## Installation Steps >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo 1. Install MySQL Server >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo 2. Run DM POS React installer >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
echo 3. Follow setup wizard >> "distribution\PANDUAN_INSTALASI_CLIENT.md"
exit /b 0

:cleanup_and_exit
if exist "sfx_config.txt" del "sfx_config.txt"
if exist "distribution" rmdir /s /q "distribution"
if exist "temp" rmdir /s /q "temp"
echo.
echo [ERROR] Distribution creation failed!
timeout /t 5 /nobreak >nul
exit /b 1