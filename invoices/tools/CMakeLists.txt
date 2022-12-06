cmake_minimum_required(VERSION 3.16)

project(invoicetools)
set(EXTENSION_ID "ch.banana.application.invoice.tools")

find_package(Qt6 COMPONENTS Core REQUIRED)

# The target is used to build the extension to a sbaa package
# and set the source files for the IDE
add_custom_target(invoiceapp ALL
    COMMAND ${QT_CMAKE_EXPORT_NAMESPACE}::rcc -o ${EXTENSION_ID}.sbaa --binary ${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES ${EXTENSION_ID}.qrc
    SOURCES ${EXTENSION_ID}.manifest.json
    SOURCES README.md
)


