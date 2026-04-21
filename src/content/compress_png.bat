@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ===== 配置 =====
set PNGQUANT_PATH=D:\SoftArchive\Tools\pngquant\pngquant.exe
set QUALITY=70-90
set MIN_SIZE=204800
set LIST_FILE=%temp%\png_list.txt

echo.
echo ===== 正在索引文件 =====
echo.

REM ===== 生成文件列表 =====
del "%LIST_FILE%" 2>nul

for /r %%i in (*.png) do (
    if %%~zi gtr %MIN_SIZE% (
        echo %%i>>"%LIST_FILE%"
    )
)

REM ===== 统计数量 =====
set count=0
for /f %%i in (%LIST_FILE%) do set /a count+=1

echo 共找到 %count% 个需要处理的文件
echo.

REM ===== 总体大小（前）=====
set before=0
for /r %%i in (*.png) do set /a before+=%%~zi
echo 原始总大小: %before% bytes
echo.

REM ===== 处理 =====
set index=0

for /f "delims=" %%i in (%LIST_FILE%) do (
    set /a index+=1

    for %%a in ("%%i") do set old=%%~za

    echo.
    echo [!index!/%count%] 处理中...
    echo %%i

    "%PNGQUANT_PATH%" --force --ext .png --quality=%QUALITY% "%%i"
    magick "%%i" -strip "%%i"

    for %%a in ("%%i") do set new=%%~za

    set ratio=0
    if !old! gtr 0 set /a ratio=100*!new!/!old!

    echo 原始: !old! → !new! bytes  (!ratio!%%)
)

echo.
echo ===== 压缩完成 =====
echo.

REM ===== 总体大小（后）=====
set after=0
for /r %%i in (*.png) do set /a after+=%%~zi

echo 压缩后总大小: %after% bytes
set /a diff=%before%-%after%
echo 节省体积: %diff% bytes

echo.
pause