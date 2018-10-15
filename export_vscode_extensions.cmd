@echo off

echo Export the following extensions:
cmd /C code --list-extensions
pause

echo @echo off > install_extensions.cmd
echo REM The following is an auto-generated list of extensions used by this project. >> install_extensions.cmd
echo REM Exported on: %date% %time% >> install_extensions.cmd

for /F "tokens=*" %%i in ('code --list-extensions') do @echo call code --install-extension %%i >> install_extensions.cmd

echo pause >> install_extensions.cmd

echo.
echo Completed.
pause