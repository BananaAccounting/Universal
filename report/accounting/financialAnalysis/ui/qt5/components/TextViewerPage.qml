import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "../application"
import "../components" 1.0

import ch.banana.qml.utils 1.0

BasePage {
   title: qsTr("Text viewer")
   property alias text: textArea.text

   FontLoader { id: fixedFont; name: "Courier" }

   ColumnLayout {
      anchors.fill: parent

      StyledScrollableTextArea {
         id: textArea
         Layout.fillWidth: true
         Layout.fillHeight: true
         readOnly: true
         font.family: fixedFont.name
         wrapMode: TextEdit.NoWrap
         placeholderText: qsTr("empty")
      }

      StyledButton {
         text: qsTr("Copy to cliboard")
         Layout.fillWidth: true
         onClicked : copyToClipboard.copyToClipboard(textArea.text)
      }

   }

   CopyToClipboard {
      id: copyToClipboard
   }
}
