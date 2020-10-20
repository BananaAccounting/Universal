import QtQuick 2.14
import QtQuick.Layouts 1.14

import "." 1.0

Item {
    id: root
    width: ListView.view.width ? ListView.view.width : 0
    height: Stylesheet.titleFontSize * 2.8 + (itemDescription2 ? Stylesheet.titleFontSize * 1.2 : 0) + (showHighlight && isNextItem ? 4 : 0)

    /** Item's title */
    property alias itemText: textitem.text

    /** Item's description */
    property alias itemDescription: descriptionitem.text

    /** Item's description, second line*/
    property alias itemDescription2: descriptionitem2.text

    /** Item's count */
    property alias itemCount: countitem.text

    /** True if this is highlighted as next item */
    property bool isNextItem: false

    /** Item's title */
    property bool showHighlight: false

    signal clicked

    Rectangle {
        anchors.fill: parent
        anchors.rightMargin: Stylesheet.defaultMargin
        // color: showHighlight && root.ListView.isCurrentItem ? Stylesheet.currentSelectionColor : "transparent"
    }

    ColumnLayout {
       anchors.verticalCenter: parent.verticalCenter
       anchors.left: parent.left
       anchors.right: parent.right
       anchors.rightMargin: Stylesheet.defaultMargin

       RowLayout {
          Text {
              id: textitem
              Layout.fillWidth: true
              font.pixelSize: Stylesheet.titleFontSize
          }

          Text {
              id: countitem
              visible: text.length
              font.pixelSize: Stylesheet.titleFontSize
          }
       }

       Text {
           id: descriptionitem
           font.pixelSize: Stylesheet.descriptionFontSize
           visible: text.length
       }

       Text {
           id: descriptionitem2
           font.pixelSize: Stylesheet.descriptionFontSize
           visible: text.length
       }
    }

    Rectangle {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.rightMargin: Stylesheet.defaultMargin
        height: showHighlight && isNextItem ? 5 : 1
        // color: showHighlight && isNextItem ? Stylesheet.currentSelectionColor : "#424246"
    }

    MouseArea {
        id: mouse
        anchors.fill: parent
        onClicked: {
           enabled = false
           root.clicked()
           disabledClickTimer.running = true
        }
    }

    // This timer is used to avoid the double click on a item of the list
    Timer {
       id: disabledClickTimer
       interval: 500
       running: true
       repeat: false
       onTriggered: mouse.enabled = true
    }

}
