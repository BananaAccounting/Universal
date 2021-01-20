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
               text: qsTr("Reclassified Assets variation")
               font.pixelSize: Stylesheet.titleFontSize
               Layout.bottomMargin: Stylesheet.defaultMargin
               Layout.alignment: Qt.AlignHCenter | Qt.AlignVCenter
            }

            StyledChartRAtt {
               id: mainChart
               height: availableHeight
               width: availableWidth
               Layout.fillWidth: true
               Layout.fillHeight: true

               function convertToPerc(dataSerie, dataSum) {
                  for (var i = 0; i < dataSerie.length; i++) {
                     var amount = dataSerie[i];
                     var sum = dataSum[i];
                     if (sum && !Banana.SDecimal.isZero(sum)) {
                        amount = amount/sum*100;
                        dataSerie[i] = amount;
                        dataSerie[i]=dataSerie[i];
                     }
                  }
                  return dataSerie;
               }

               function loadData() {
                  showLoadingIndicator(true)

                  chartOptions.legend.display = true;
                  chartOptions.legend.position = 'bottom';

                  var financialStatementAnalysis = new FinancialStatementAnalysis(Banana.document);
                  //Recovery of current settings.
                  var savedParam =Banana.document.getScriptSettings("financialStatementAnalysis");
                  if (savedParam.length > 0) {
                     var param = JSON.parse(savedParam);
                     financialStatementAnalysis.setParam(param);
                  }
                  financialStatementAnalysis.loadData();

                  var yearList = [];
                  var dataSerie1 = [];
                  var dataSerie2 = [];
                  var dataSerie3 = [];
                  var dataSerie4 = [];
                  var dataSum = [];

                  for (var i = financialStatementAnalysis.data.length - 1; i >= 0; i--) {
                     var periodo = financialStatementAnalysis.data[i].period.StartDate;
                     //for dont cut the Budget string in Budg.
                     var elementType = financialStatementAnalysis.data[i].period.Type;
                     if (elementType === "Y") {
                        periodo = periodo.substr(0, 4);
                     }
                     var year= periodo;
                     if (yearList.indexOf(year)<0){
                        yearList.push(year);
                     }
                     
                     var sumLiq= Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.ca.liqu.balance);
                     dataSerie1.push(sumLiq);
                     var sumCred=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.ca.cred.balance);
                     dataSerie2.push(sumCred);
                     var sumStoc=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.ca.stoc.balance);
                     dataSerie3.push(sumStoc);
                     var sumFixa=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.fa.fixa.balance);
                     dataSerie4.push(sumFixa); 
                     
                     var sum = sumLiq;
                     sum = Banana.SDecimal.add(sumCred, sum);
                     sum = Banana.SDecimal.add(sumStoc, sum);
                     sum = Banana.SDecimal.add(sumFixa, sum);
                     dataSum.push(sum);
                  }
                  dataSerie1 = convertToPerc(dataSerie1, dataSum);
                  dataSerie2 = convertToPerc(dataSerie2, dataSum);
                  dataSerie3 = convertToPerc(dataSerie3, dataSum);
                  dataSerie4 = convertToPerc(dataSerie4, dataSum);

                  chartData.labels = []
                  for (var i = 0; i < yearList.length; i++) {
                     var year = yearList[i];
                     chartData.labels.push(year);
                  }
                  chartData.datasets = [
                  {label: qsTr('Liquidity'), data: dataSerie1, backgroundColor:defaultColors[0].fill},
                  {label: qsTr('Credits'), data: dataSerie2, backgroundColor:defaultColors[1].fill},
                  {label: qsTr('Stocks'), data: dataSerie3, backgroundColor:defaultColors[2].fill},
                  {label: qsTr('Fixed Assets'), data: dataSerie4, backgroundColor:defaultColors[3].fill}
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