import QtQml 2.14
import QtQuick 2.14
import QtQuick.Window 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "components" 1.0

BasePage {
   title: qsTr("Financing Charts")
   width: 800
   height: 600

   function loadCharts() {
      pageModel.clear();
      pageModel.append({'title': 'Financing index variation','page': 'chartFin.qml'})
      pageModel.append({'title': 'Liquidity index variation','page': 'chartLiqu.qml'})
      pageModel.append({'title': 'Profitability index variation','page': 'chartProf.qml'})
      pageModel.append({'title': 'Reclassified Assets variation','page': 'chartRAtt.qml'})
      pageModel.append({'title': 'Reclassified liabilities and equity variation','page': 'chartRPass.qml'})
      pageModel.append({'title': 'Reclassified Profit and Loss','page': 'chartRProLos.qml'})
   }

   Component.onCompleted: {
      loadCharts()
      stackView.push(Qt.resolvedUrl(pageModel.get(0).page))
   }

   ListModel {
      id: pageModel
   }

   ColumnLayout{
   
      anchors.fill: parent
   
      RowLayout {
         clip: true
         width: parent.width
         Layout.margins: Stylesheet.defaultMargin

         Label {
            text: qsTr("Select a chart")
            Layout.leftMargin: 10
         }

         StyledComboBox {
            id: graphsComboBox
            model: pageModel
            textRole: "title"
            editable: false
            Layout.leftMargin: 10
            Layout.preferredWidth: 320
            Layout.fillWidth: true
            currentIndex: 0
            displayText: pageModel.get(currentIndex).title
      
            delegate: ListItemDelegate {
               itemText: title
               width: parent.width
               onClicked: {
                  graphsComboBox.currentIndex = index
                  stackView.push(Qt.resolvedUrl(page))
                  graphsComboBox.popup.close()
               }
            }
         }
      }
 
      StackView {
         id: stackView
         Layout.fillHeight: true
         Layout.fillWidth: true
         Layout.margins: 40
      }
   }

}
