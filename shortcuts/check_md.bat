@echo off
chcp 65001 > nul
for %%F in (*.md) do (
    python "%~dp0check_md_helper.py" "%%F"
)
pause
