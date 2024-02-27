cmake_minimum_required(VERSION 3.16)

project(InvoiceTools)
set(EXTENSION_ID "ch.banana.application.invoice.tools")

set(BAN_QT_RCC $ENV{BAN_QT_RCC} CACHE FILEPATH "Path to Qt rcc executable")
set(BAN_QT_LUPDATE $ENV{BAN_QT_LUPDATE} CACHE FILEPATH "Path to Qt lupdate executable")
set(BAN_QT_LRELEASE $ENV{BAN_QT_LRELEASE} CACHE FILEPATH "Path to Qt lrelease executable")
set(BAN_EXE_PATH $ENV{BAN_EXE_PATH} CACHE FILEPATH "Path to BananaPlus executable, used to run tests")

FILE(GLOB_RECURSE TS_SRC_FILES src/*.ts)
FILE(GLOB_RECURSE JS_SRC_FILES src/*.js)
FILE(GLOB_RECURSE QML_SRC_FILES src/*.qml)

# The target is used to build the extension to a sbaa package
# and set the source files for the IDE
add_custom_target(InvoiceTools ALL
    COMMAND ${BAN_QT_RCC} -o ${EXTENSION_ID}.sbaa --binary src/${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES src/${EXTENSION_ID}.qrc
    SOURCES src/ch.banana.application.invoice.tools.manifest.json
    SOURCES ${TS_SRC_FILES}
    SOURCES ${JS_SRC_FILES}
    SOURCES ${QML_SRC_FILES}
)

add_dependencies(${PROJECT_NAME} lrelease) #build .qm files when building the sbaa package

# The variable translations_files contains the list of translations files
set(translations_files
    translations/translations_de.ts
    translations/translations_it.ts
    translations/translations_fr.ts
)

# The target lupdate is used to update *.ts translations files
set(lupdate_commands)
foreach(tr_file ${translations_files})
  list(APPEND lupdate_commands
    COMMAND ${BAN_QT_LUPDATE} ${EXTENSION_ID}.qrc -ts ${tr_file})
endforeach()

add_custom_target(lupdate
    ${lupdate_commands}
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/src
)

# The target lrelease is used to compile *.ts files to *.qm files
set(lrelease_commands)
set(lrelease_files)
string(REPLACE ".ts" "" lrelease_files "${translations_files}") #remove file extension
foreach(tr_file ${lrelease_files})
  list(APPEND lrelease_commands
      COMMAND ${BAN_QT_LRELEASE} ${tr_file}.ts -qm ${tr_file}.qm)
endforeach()

add_custom_target(lrelease
    ${lrelease_commands}
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/src
)

FILE(GLOB_RECURSE JS_TEST_FILES test/*.js)

# The target test is used to test the extension
add_custom_target(test
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMAND ${BAN_EXE_PATH} -cmd=runtestsapps -cmd_exit=1 -cmd_p1=${CMAKE_SOURCE_DIR}/${EXTENSION_ID}.sbaa -cmd_op=A
    SOURCES ${JS_TEST_FILES}
)



