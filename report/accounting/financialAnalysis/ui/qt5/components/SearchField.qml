import QtQuick 2.14
import QtQuick.Controls 2.14

StyledTextField {
   selectByMouse: true

   /** The signal typingFinished is emited after the interval
    typingFinishedTimeout from the last user's typing has elapsed. */
   signal typingFinished()

   /** The property typingFinishedTimeout set the interval to wait
     before emitting the signal typingFinished. */
   property int typingFinishedTimeout: 600

   onTextChanged: timerTypingFinished.restart()

   Timer {
      id: timerTypingFinished
      interval: typingFinishedTimeout
      repeat: false
      onTriggered: typingFinished()
   }
}
