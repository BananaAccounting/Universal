import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "." 1.0

Item {
   property string title: qsTr("Info")

   property string itemDescription : ""
   property string itemUrl : ""

   ColumnLayout {
      anchors.fill: parent

      Text {
         text: qsTr("Item")
         font.pixelSize: Stylesheet.descriptionFontSize
         Layout.fillWidth: true
      }

      StyledTextField {
         readOnly: true
         text: itemDescription
         font.pixelSize: Stylesheet.titleFontSize
         Layout.fillWidth: true

         Layout.bottomMargin: Stylesheet.defaultMargin
      }

      Text {
         text: qsTr("Info")
         font.pixelSize: Stylesheet.descriptionFontSize
      }

      StyledScrollableTextArea {
         id: itemInfoData
         readOnly: true
         font.pixelSize: Stylesheet.descriptionFontSize
         height: 400
         font.italic: true
         Layout.fillHeight: true
         Layout.fillWidth: true
      }
   }

   onItemUrlChanged: loadItemInfo()

   function loadItemInfo() {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
         if (xmlhttp.readyState === XMLHttpRequest.DONE)
         {
            if (xmlhttp.status !== 200)
               itemInfoData.text = "Network error";
            else
               itemInfoData.text = xmlhttp.responseText;
         }
      }

      xmlhttp.open("GET", itemUrl, true);
      xmlhttp.send();
   }

}
