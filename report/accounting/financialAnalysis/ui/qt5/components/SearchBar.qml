import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "." 1.0

RowLayout {
   id: control
   property var textControl: null

   signal done()
   signal notFound()

   TextField {
      id: findTextField
      text: ""
      Layout.fillWidth: true
      Keys.onPressed: {
         if (event.key === Qt.Key_Enter || event.key === Qt.Key_Return) {
            searchNext()
            event.accepted = true;
         } else if (event.key === Qt.Key_Escape) {
            control.visible = false
            done()
            event.accepted = true;
         }
      }
   }

   Button {
      text: qsTr("Previous")
      onClicked: searchPrevious()
      Shortcut {
         sequence: StandardKey.FindPrevious
         onActivated: searchPrevious()
      }

   }

   Button {
      text: qsTr("Next")
      onClicked: searchNext()
      Shortcut {
         sequence: StandardKey.FindNext
         onActivated: searchNext()
      }
   }

   Button {
      text: qsTr("Done")
      onClicked: {
         control.visible = false
         done()
      }
   }

   onVisibleChanged: {
      if (visible)
         findTextField.focus = true
   }

   function searchNext() {
      if (!textControl || !textControl.length || !findTextField.length) {
         notFound()
         return
      }

      var text = textControl.text.toLowerCase();
      var findText = findTextField.text.toLowerCase();

      var startPosition = textControl.cursorPosition
      if (startPosition < 0 || startPosition >= text.length)
         startPosition = 0

      var nextPosition = text.indexOf(findText, startPosition)
      if (nextPosition >= 0) {
         textControl.select(nextPosition, nextPosition + findText.length)
         return true;
      }

      if (startPosition === 0) {
         notFound()
         return false;
      }

      nextPosition = text.indexOf(findText)
      if (nextPosition >= 0) {
         textControl.select(nextPosition, nextPosition + findText.length)
         return true;
      }

      notFound()
      return false;
   }

   function searchPrevious() {
      if (!textControl || !textControl.length || !findTextField.length) {
         notFound()
         return
      }

      var text = textControl.text.toLowerCase();
      var findText = findTextField.text.toLowerCase();

      var startPosition = textControl.cursorPosition - findText.length - 1
      if (startPosition < 0 || startPosition > text.length)
         startPosition = text.length

      var nextPosition = text.lastIndexOf(findText, startPosition)
      if (nextPosition >= 0) {
         textControl.select(nextPosition, nextPosition + findText.length)
         return true;
      }

      if (startPosition === text.length) {
         notFound()
         return false;
      }

      nextPosition = text.lastIndexOf(findText)
      if (nextPosition >= 0) {
         textControl.select(nextPosition, nextPosition + findText.length)
         return true;
      }

      notFound()
      return false;
   }
}
