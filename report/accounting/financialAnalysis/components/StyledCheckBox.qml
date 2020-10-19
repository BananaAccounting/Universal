import QtQuick 2.14
import QtQuick.Controls 2.14

import "." 1.0

CheckBox {
   id: control
   font.pixelSize: Stylesheet.descriptionFontSize
   indicator: Rectangle {
             implicitWidth: 16
             implicitHeight: 16
             x: control.leftPadding
             y: parent.height / 2 - height / 2
             border.color: "darkgrey"

             Rectangle {
                 width: 8
                 height: 8
                 x: 4
                 y: 4
                 color: control.down ? "darkgrey" : "black"
                 visible: control.checked
             }
         }
}
