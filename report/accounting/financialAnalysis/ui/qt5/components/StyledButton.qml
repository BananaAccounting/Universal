import QtQuick 2.14
import QtQuick.Controls 2.14

import "." 1.0

Button {
   id: control
   contentItem: Label {
      text: control.text
      horizontalAlignment: Text.AlignHCenter
      font.pixelSize: Stylesheet.titleFontSize
      color: control.enabled ? "black" : "gray"
   }
}
