import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "." 1.0

Item {
   id: control

   property var contextMenu: baseContextMenu

   property alias cursorVisible: textArea.cursorVisible
   property alias cursorPosition: textArea.cursorPosition
   property alias font: textArea.font
   property alias placeholderText : textArea.placeholderText
   property alias readOnly: textArea.readOnly
   property alias text: textArea.text
   property alias textFormat  : textArea.textFormat
   property alias selectecText: textArea.selectedText
   property alias wrapMode: textArea.wrapMode

   property bool _copyAllOnCopy: false

   signal textEdited()

   ScrollView {
      id: scrollView
      clip: true
      anchors.fill: parent

      background : Rectangle {
         border.color: scrollView.activeFocus ? "blue" : "#bdbebf"
         border.width: scrollView.activeFocus ? 2 : 1
      }

      TextArea {
         id: textArea
         selectByMouse: true
         persistentSelection: false
         implicitWidth: scrollView.availableWidth

         onTextChanged: {
            if (focus)
               control.textEdited()
         }

         onActiveFocusChanged: {
            if (!activeFocus && !persistentSelection)
               deselect()
         }
      }
   }

   MouseArea {
      anchors.fill: parent
      acceptedButtons: control.contextMenu ? Qt.RightButton : Qt.NoButton

      onPressed: {
         if (mouse.button === Qt.RightButton) {
            mouse.accepted = true
            openMenu(mouse)
         }
      }

      function openMenu(mouse) {
         if (control.contextMenu) {
            if (!scrollView.focus) {
               scrollView.forceActiveFocus()
               textArea.forceActiveFocus()
               if (!textArea.readOnly) {
                  textArea.selectAll()
               } else {
                  _copyAllOnCopy = true
               }
            } else {
               textArea.persistentSelection = true
            }

            control.contextMenu.x = mouse.x
            control.contextMenu.y = mouse.y
            control.contextMenu.open()
         }
      }
   }

   Connections {
      target: contextMenu
      function onClosed()  {
         scrollView.forceActiveFocus()
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

   function copy() {
      if (_copyAllOnCopy || selectecText.length === 0) {
         textArea.selectAll()
         textArea.copy()
         textArea.deselect()
      } else {
         textArea.copy()
      }
   }

   function length() {
      return textArea.length()
   }

   function select(start, end) {
      textArea.select(start, end)
   }
}
