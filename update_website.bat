@echo off
setlocal

set TOOL=F:\FERJEN\01_PROJECTS\HOT01_HOT_Admin\apps\hot_chest_counter
set TRACKER=F:\FERJEN\01_PROJECTS\HOT01_HOT_Admin\HOT_K305_CLAN_TRACKER.xlsx
set SITE=F:\FERJEN\01_PROJECTS\HOT01_HOT_Admin\apps\hot_website\private\data

echo.
echo === HOT Clan — updating website data ===
echo.

REM Copy roster
echo Copying HOT_Roster.json...
copy /Y "%TOOL%\data\HOT_Roster.json" "%SITE%\HOT_Roster.json"
if errorlevel 1 ( echo ERROR: could not copy roster & pause & exit /b 1 )

REM Copy Excel tracker
echo Copying HOT_K305_CLAN_TRACKER.xlsx...
if exist "%TRACKER%" (
    copy /Y "%TRACKER%" "%SITE%\HOT_K305_CLAN_TRACKER.xlsx"
) else (
    echo WARNING: tracker not found at %TRACKER%, skipping
)

REM Copy current month's gift CSV (legacy — kept for reference)
for /f "tokens=2 delims==" %%a in ('wmic os get LocalDateTime /value ^| find "="') do set dt=%%a
set MONTH=%dt:~0,4%-%dt:~4,2%
set GIFTFILE=%TOOL%\data\gifts\gifts_%MONTH%.csv
echo Copying gifts_%MONTH%.csv...
if exist "%GIFTFILE%" (
    copy /Y "%GIFTFILE%" "%SITE%\gifts_%MONTH%.csv"
) else (
    echo WARNING: %GIFTFILE% not found, skipping
)

REM Git push
cd /d "F:\FERJEN\01_PROJECTS\HOT01_HOT_Admin\apps\hot_website"
echo.
echo Pushing to GitHub...
git add .
git commit -m "data update %date% %time:~0,5%"
git push

echo.
echo === Done! Netlify will deploy in ~30 seconds ===
echo.
pause