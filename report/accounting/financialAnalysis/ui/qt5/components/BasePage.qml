import QtQuick 2.14

/** The item BasePage ist the base item for all pages in the WebMangoClient */
Item {
   // Title of the page
   property string title: qsTr("Page")

   // This signal is emitted when the page is closed with a accepted action
   signal accepted()

   // This signal is emitted when the page is closed with a rejected action
   signal rejected()
}
