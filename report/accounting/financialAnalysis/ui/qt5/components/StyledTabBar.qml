import QtQuick 2.14
import QtQuick.Controls 2.14

import "." 1.0
import "../components" 1.0

TabBar {
   background: Item {
      Rectangle {
         anchors.left: parent.left
         anchors.right: parent.right
         anchors.bottom: parent.bottom
         anchors.bottomMargin: -3
         height: 1
         color: Stylesheet.tabBarBorderColor
      }
   }
}
