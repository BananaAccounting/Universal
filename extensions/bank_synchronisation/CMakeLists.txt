cmake_minimum_required(VERSION 3.16)

project(ch.banana.uni.read.file.to.reconcile)
set(EXTENSION_ID "ch.banana.uni.read.file.to.reconcile")

find_package(Qt6 COMPONENTS Core REQUIRED)
find_package(Qt6 COMPONENTS LinguistTools REQUIRED)

# The target yokoyimportexpenses is used to build the extension to a sbaa package
# and set the source files for the IDE
add_custom_target(ch.banana.uni.read.file.to.reconcile ALL
    COMMAND ${QT_CMAKE_EXPORT_NAMESPACE}::rcc -o ${EXTENSION_ID}.sbaa --binary ${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES ${EXTENSION_ID}.qrc
)
