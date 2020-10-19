import QtQuick 2.14
import QtQuick.Controls 2.14

import "." 1.0

ListView {
   signal endReached

   property bool emitEndReached: true

   onAtYEndChanged: {
      if (atYEnd && count > 0 && emitEndReached) {
         emitEndReached = false
         endReached()
         showLoadingIndicator(true)
      }
   }

   function enableEmitEndReached(emit) {
      emitEndReached = emit
   }

   function showLoadingIndicator(show) {
      busyIndicator.running = show
   }

   BusyIndicator {
      id: busyIndicator
      running: false
      anchors.horizontalCenter: parent.horizontalCenter
      anchors.verticalCenter: parent.verticalCenter
   }

}
