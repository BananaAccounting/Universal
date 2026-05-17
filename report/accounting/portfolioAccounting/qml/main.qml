import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    width: 640
    height: 480

    property var currenciesList: getCurrenciesList(Banana.document)

    Rectangle {
        anchors.fill: parent
        color: "#f3f4f6"

        GridLayout {
            anchors.fill: parent
            anchors.margins: 16

            columns: 3
            rowSpacing: 12
            columnSpacing: 12

            Repeater {
                model: root.currenciesList // indico che la variabile che uso è di proprietà drl oggetto root.

                Rectangle {

                    required property string modelData

                    Layout.preferredWidth: 200
                    Layout.preferredHeight: 120

                    radius: 8

                    color: "#ffffff"

                    border.width: 1
                    border.color: "#d6dbe1"

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 14
                        spacing: 6

                        Label {
                            text: modelData

                            color: "#4b5563"

                            font.bold: true
                            font.pixelSize: 14
                        }

                        Label {
                            text: getTotalAssetCurrentValue(Banana.document, modelData)

                            color: "#111827"

                            font.pixelSize: 26
                            font.bold: true
                        }

                        Label {
                            text: "Current value"

                            color: "#6b7280"

                            font.pixelSize: 12
                        }
                    }
                }
            }
        }
    }
}