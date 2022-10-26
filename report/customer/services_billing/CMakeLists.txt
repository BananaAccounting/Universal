cmake_minimum_required(VERSION 3.16)

project(servicesbilling)
set(EXTENSION_ID "ch.banana.universal.servicesbilling")

find_package(Qt6 COMPONENTS Core REQUIRED)

# The target is used to build the extension to a sbaa package
# and set the source files for the IDE
add_custom_target(servicesbilling ALL
    COMMAND ${QT_CMAKE_EXPORT_NAMESPACE}::rcc -o build/${EXTENSION_ID}.sbaa --binary src/${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES src/${EXTENSION_ID}.qrc
    SOURCES src/${EXTENSION_ID}.manifest.json
    SOURCES README.md
    SOURCES src/changelog.md
    SOURCES src/ch.banana.universal.servicesbilling.createinvoices.js
    SOURCES test/ch.banana.universal.servicesbilling.createinvoices.test.js
)


