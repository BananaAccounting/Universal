import QtQuick 2.14
import QtQuick.Controls 2.14

import "." 1.0

TextArea {
   id: textArea
   selectByMouse: true

   background: Rectangle {
      border.color: textArea.activeFocus ? "blue" : "#bdbebf"
      border.width: textArea.activeFocus ? 2 : 1
   }

   property var contextMenu: baseContextMenu
   property bool _copyAllOnCopy: false

   signal textEdited()

   onTextChanged: {
      if (focus)
         textArea.textEdited()
   }

   MouseArea {
      anchors.fill: parent
      acceptedButtons: textArea.contextMenu ? Qt.RightButton : Qt.NoButton

      onPressed: {
         if (mouse.button === Qt.RightButton) {
            mouse.accepted = true
            openMenu(mouse)
         }
      }

      function openMenu(mouse) {
         textArea.persistentSelection = true
         if (!textArea.focus) {
            textArea.forceActiveFocus()
            if (!textArea.readOnly) {
               textArea.selectAll()
            } else {
               _copyAllOnCopy = true
            }
         }
         textArea.contextMenu.x = mouse.x
         textArea.contextMenu.y = mouse.y
         textArea.contextMenu.open()
      }
   }

   Connections {
      target: contextMenu
      function onClosed()  {
         textArea.forceActiveFocus()
         textArea.persistentSelection = false
         _copyAllOnCopy = false
      }
   }

   Menu {
      id: baseContextMenu
      focus: false

      MenuItem {
         text: qsTr("Cut")
         enabled: !textArea.readOnly && textArea.selectedText.length > 0
         onClicked: textArea.cut()
      }

      MenuItem {
         text: qsTr("Copy")
         enabled: textArea.readOnly || textArea.selectedText.length > 0
         onClicked: {
            if (_copyAllOnCopy || textArea.selectedText.length === 0) {
               textArea.selectAll()
               textArea.copy()
               textArea.deselect()
            } else {
               textArea.copy()
            }
         }
      }

      MenuItem {
         text: qsTr("Paste")
         enabled: !textArea.readOnly && textArea.canPaste
         onClicked: textArea.paste()
      }
   }
}
