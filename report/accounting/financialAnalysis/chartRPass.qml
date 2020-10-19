import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

import "components" 1.0
import "charts" 1.0

BasePage {
   id: root
   title: qsTr("Financial Statement Analysis")

   ColumnLayout {
      anchors.fill: parent

      ScrollView {
         id: scrollView
         clip: true
         Layout.fillWidth: true
         Layout.fillHeight: true

         ColumnLayout {
            width: Math.max(implicitWidth, scrollView.availableWidth)
            Layout.fillHeight: true

            Text {
               text: qsTr("Reclassified Liabilites and Equity variation")
               font.pixelSize: Stylesheet.titleFontSize
               Layout.bottomMargin: Stylesheet.defaultMargin
               Layout.alignment: Qt.AlignHCenter | Qt.AlignVCenter
            }

            StyledChartRPass {
               id: mainChart
               height: availableHeight
               width: availableWidth
               Layout.fillWidth: true
               Layout.fillHeight: true

               function loadData() {
                  showLoadingIndicator(false)
                  // showLoadingIndicator(true)

                  chartOptions.legend.display = true;
                  chartOptions.legend.position = 'bottom';

                  var financialStatementAnalysis = new FinancialStatementAnalysis(Banana.document);
                  financialStatementAnalysis.loadData();
                  var yearList = [];
                  var dataSerie1 = [];
                  var dataSerie2 = [];
                  var dataSerie3 = [];
                  var dataSerie4 = [];
                  for (var i = 0; i < financialStatementAnalysis.data.length; i++) {
                     var periodo = financialStatementAnalysis.data[i].period.StartDate;
                     if (periodo.length<4)
                        continue;
                     var year = periodo.substr(0, 4);
                     if (yearList.indexOf(year)<0){
                        yearList.push(year);
                     }
                     dataSerie1.push(Banana.SDecimal.abs(financialStatementAnalysis.data[i].bilancio.ct.stdc.balance));
                     dataSerie2.push(Banana.SDecimal.abs(financialStatementAnalysis.data[i].bilancio.ct.ltdc.balance));
                     dataSerie3.push(Banana.SDecimal.abs(financialStatementAnalysis.data[i].bilancio.cp.obca.balance));
                     dataSerie4.push(Banana.SDecimal.abs(financialStatementAnalysis.data[i].bilancio.cp.reut.balance)); 
                  }
                  chartData.labels = []
                  for (var i = 0; i < yearList.length; i++) {
                     var year = yearList[i];
                     chartData.labels.push(year);
                  }
                  chartData.datasets = [
                  {label: qsTr('short term debt capital'), data: dataSerie1, backgroundColor:defaultColors[0].fill},
                  {label: qsTr('long term debt capital'), data: dataSerie2, backgroundColor:defaultColors[1].fill},
                  {label: qsTr('owned capital'), data: dataSerie3, backgroundColor:defaultColors[2].fill},
                  {label: qsTr('reserves and profits'), data: dataSerie4, backgroundColor:defaultColors[3].fill}
                  ]

                  /*chartData.labels = ["risk1","risk2"]
                  chartData.datasets = [
                  {label: 'low',data:[67.8,30,20], backgroundColor:'#D6E9C6'},
                  {label: 'moderate',data:[20.7,30,20], backgroundColor:'#FAEBCC'},
                  {label: 'high',data:[11.4, 40,60], backgroundColor:'#EBCCD1'}
                  ]*/
                  repaintChart();
                  showLoadingIndicator(false)
               }

            }

            Item {
                height: 9
            }

         }
      }

      RowLayout {
         Layout.topMargin: Stylesheet.defaultMargin

         Item {
            Layout.fillWidth: true
         }
      }
   }

   Component.onCompleted: {
      loadData();

   }

   function loadData(){
     mainChart.loadData();
   }

}