import QtQml 2.14
import QtQuick 2.14
import QtQuick.Window 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "components" 1.0

BasePage {
   title: "Financing Charts"
   width: 800
   height: 600

   function loadCharts() {
      var LeverageChart=qsTr(" Leverage index variation");
      var LiquidityChart=qsTr(" Liquidity index variation");
      var ProfitabilityChart=qsTr(" Profitability index variation");
      var EfficiencyChart=qsTr(" Efficiency index variation");
      var ReclassifiedAssetsVariationChart=qsTr(" Reclassified Assets variation");
      var ReclassifiedLiabilitiesAndEquityVariationChart=qsTr(" Reclassified liabilities and equity variation");
      var ReclassifiedProfitAndLossVariation=qsTr(" Reclassified Profit and Loss variation");

      pageModel.clear();
      pageModel.append({'title': LeverageChart,'page': 'chartLev.qml'});
      pageModel.append({'title': LiquidityChart,'page': 'chartLiqu.qml'});
      pageModel.append({'title': ProfitabilityChart,'page': 'chartProf.qml'});
      pageModel.append({'title': EfficiencyChart,'page': 'chartEff.qml'});
      pageModel.append({'title': ReclassifiedAssetsVariationChart,'page': 'chartRAtt.qml'});
      pageModel.append({'title': ReclassifiedLiabilitiesAndEquityVariationChart,'page': 'chartRPass.qml'});
      pageModel.append({'title': ReclassifiedProfitAndLossVariation,'page': 'chartProfLoss.qml'});
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
