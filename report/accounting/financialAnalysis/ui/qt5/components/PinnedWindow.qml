import QtQml 2.14
import QtQuick 2.14
import QtQuick.Window 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "../components" 1.0

/** The item BasePage ist the base item for all pages */
Window {
    id: window
    visible: false
    width: 600
    height: 900

    ColumnLayout {
        anchors.fill: parent

        Item { // Title bar
           width: parent.width
           height: Stylesheet.titleFontSize * 2.5
           visible: stackView.currentItem && stackView.currentItem.title

           Rectangle { // Title background
              height: Stylesheet.titleFontSize * 2.5
              width: window.width
              color: "lightgrey"
           }

           Text { // Title
              text: (stackView.currentItem && stackView.currentItem.title) ? stackView.currentItem.title : ""
              font.pixelSize: Stylesheet.titleFontSize
              color: WebMango.serverTestMode ? "Green" : "black"
              x: Stylesheet.defaultMargin
              anchors.verticalCenter: parent.verticalCenter
           }
        }

        StackView {
           id: stackView

           Layout.fillHeight: true
           Layout.fillWidth: true
           Layout.margins: 2 * Stylesheet.defaultMargin
        }
    }

    function addComponent(item, properties) {
        var component = Qt.createComponent(item)
        if (component.status === Component.Error) {
           console.log(component.errorString())
        } else if (component.status === Component.Ready) {
            var componentObj = component.createObject(window, properties)
            stackView.push(componentObj)
        }
    }
}
