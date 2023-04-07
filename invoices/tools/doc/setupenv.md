# Developer environment

This document descibe how to set up the developer enviroment.

After you setup the project you will be able to:

- Build the extention's package
- Update the translations
- Run the tests

## Install CMake

Download and install CMake from <https://cmake.org>.
Verify that the installed version is is your PATH, if not open CMake go to Menu Tools -> How to install CMake for command line use and follow the instructions.

## Visual Studio Code

### Install extensions for cmake

Install the following extensions:

- twxs.cmake: CMake language support for Visual Studio Code (twsx)  
  This is used for syntax highligh.
- ms-vscode.cmake-tools: CMake Tools (microsoft)  
  This is used for enabling the cmake pane, where you can build the targets

### Set paths to qt tools and banana plus

Create the file .vscode/settings.json and set the requested cmake options. You can take the following example and modify the paths.

```json
{
    "cmake.configureSettings": {
        "BAN_QT_RCC": "/Users/user_xxx/Programming/Qt/6.5.0/macos/libexec/rcc",
        "BAN_QT_LUPDATE": "/Users/user_xxx/Programming/Qt/6.5.0/macos/bin/lupdate",
        "BAN_QT_LRELEASE": "/Users/user_xxx/Programming/Qt/6.5.0/macos/bin/lrelease",
        "BAN_EXE_PATH": "/Users/user_xxx/Programming/Repo/Banana/build/bin/BananaPlus.app/Contents/MacOS/BananaPlus",
    }
}
````

### Set editor for *.ts files

Install the following extension:

- fabiospampinato.vscode-open-in-application: Open in application extension

Open vscode user setting file and add the editor for *.ts files

```json
    "openInApplication.applications": {
        "*.ts": "QtLinguist"
    }
```

To open a *.ts file with QtLinguist right click on the file in the file explorer pane and select Open in Application.

NB.: in the operating system you have to assign the *.ts to QtLinquist application.


