cmake_minimum_required(VERSION 3.16)

project(civicrmimport)
set(EXTENSION_ID "ch.banana.app.civicrmimport")

# CMake options
# Create a file .vscode/settings.json with the following content to set the options, 
# adapt the path to your environment
# {
#     "cmake.configureSettings": {
#         "BAN_QT_RCC": "/Applications/BananaPlus.app/Contents/MacOS/rcc",
#         "BAN_EXE_PATH": "/Applications/BananaPlusDev.app/Contents/MacOS/BananaPlusDev",
#     }
# }
set(BAN_QT_RCC $ENV{BAN_QT_RCC} CACHE FILEPATH "Path to Qt rcc executable")
set(BAN_EXE_PATH $ENV{BAN_EXE_PATH} CACHE FILEPATH "Path to BananaPlus executable, used to run tests")

# This target is used to build the extension to a sbaa package
add_custom_target(civicrmimport
    COMMAND ${BAN_QT_RCC} -o ${EXTENSION_ID}.sbaa --binary ${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES ${EXTENSION_ID}.qrc
)

# This target is used to run the tests of the extension
add_custom_target(test
    COMMAND ${BAN_EXE_PATH} -cmd=runtestsapps -cmd_exit=1 -cmd_p1=${CMAKE_SOURCE_DIR}/${EXTENSION_ID}.sbaa -cmd_op=A
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
)
