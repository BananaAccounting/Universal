import QtQuick 2.15
import QtQuick.Controls 2.15

ComboBox {
    id: control
    implicitHeight: 28
    indicator.width: 20
    indicator.height: 20

    contentItem: StyledTextField {
        id: textField
        readOnly: !control.editable
        text: control.displayText
    }

    onActivated: {
        textField.ensureVisible(0)
    }

    background: Rectangle {
        color:"#f3f3f3"
        border.width: 1
        border.color: "#bdbebf"
        radius: 2.0
    }

     popup: Popup {
        y: control.height - 1
        width: control.width
        padding: 1

        contentItem: ListView {
            clip: true
            implicitHeight: contentHeight
            model: control.popup.visible ? control.delegateModel : null
            ScrollIndicator.vertical: ScrollIndicator { }
        }

        background: Rectangle {
            border.color: "#354793"
            radius: 2
        }
    }
}
