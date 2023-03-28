import QtQuick 2.14
import QtQuick.Controls 2.14

import "." 1.0

TabButton {
   id: control

   contentItem: Text {
      text: control.text
      font.bold: control.checked ? true : false
      font.pixelSize: Stylesheet.titleFontSize
      horizontalAlignment: Text.AlignLeft
      verticalAlignment: Text.AlignTop
   }

   background: Item {
      Rectangle {
         anchors.fill: parent
      }

      Rectangle {
         anchors.left: parent.left
         anchors.right: parent.right
         anchors.bottom: parent.bottom
         height: 3
         color: control.checked ? Stylesheet.tabBarBorderColor : "transparent"
      }
   }

}
