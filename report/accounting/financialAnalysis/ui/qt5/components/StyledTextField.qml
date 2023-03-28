import QtQuick 2.14
import QtQuick.Controls 2.14

import "." 1.0

TextField {
   id: textField
   selectByMouse: true

   /** Context menu of text field */
   property var contextMenu: baseContextMenu

   property bool _copyAllOnCopy: false

   Keys.onReleased: {
      if (event.key === Qt.Key_Escape) {
         focus = false
         event.accepted = true
      } else if (event.key === Qt.Key_Home) {
         cursorPosition = 0
         event.accepted = true
      } else if (event.key === Qt.Key_End) {
         cursorPosition = text.length
         event.accepted = true
      }
   }

   MouseArea {
      anchors.fill: parent
      acceptedButtons: textField.contextMenu ? Qt.RightButton : Qt.NoButton

      onPressed: {
         if (mouse.button === Qt.RightButton) {
            mouse.accepted = true
            openMenu(mouse)
         }
      }

      function openMenu(mouse) {
         textField.persistentSelection = true
         if (!textField.focus) {
            textField.forceActiveFocus()
            if (!textField.readOnly) {
               textField.selectAll()
            } else {
               _copyAllOnCopy = true
            }
         }
         textField.contextMenu.x = mouse.x
         textField.contextMenu.y = mouse.y
         textField.contextMenu.open()
      }
   }

   Connections {
      target: contextMenu
      function onClosed () {
         textField.forceActiveFocus()
         textField.persistentSelection = false
         _copyAllOnCopy = false
      }
   }

   Menu {
      id: baseContextMenu
      focus: false

      MenuItem {
         text: qsTr("Cut")
         enabled: !textField.readOnly && textField.selectedText.length > 0
         onClicked: textField.cut()
      }

      MenuItem {
         text: qsTr("Copy")
         enabled: textField.readOnly || textField.selectedText.length > 0
         onClicked: {
            if (_copyAllOnCopy || textField.selectedText.length === 0) {
               textField.selectAll()
               textField.copy()
               textField.deselect()
            } else {
               textField.copy()
            }
         }
      }

      MenuItem {
         text: qsTr("Paste")
         enabled: !textField.readOnly && textField.canPaste
         onClicked: textField.paste()
      }
   }
}
