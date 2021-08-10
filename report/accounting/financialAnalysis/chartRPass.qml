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
               text: qsTr("Reclassified liabilites and equity evolution")
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
                  showLoadingIndicator(false)
                  // showLoadingIndicator(true)

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
                  var texts=financialStatementAnalysis.initFinancialAnalysisTexts();
                  var yearList = [];
                  var dataSerie1 = [];
                  var dataSerie2 = [];
                  var dataSerie3 = [];
                  var dataSerie4 = [];
                  var dataSerie5 = [];
                  var dataSerie6 = [];
                  var dataSum = [];
                  for (var i = financialStatementAnalysis.data.length - 1; i >= 0; i--) {
                     var periodo = financialStatementAnalysis.data[i].period.StartDate;
                     //for dont cut the Budget string in Budg.
                     var elementType = financialStatementAnalysis.data[i].period.Type;
                     switch(elementType) {
                        case "PY":
                           periodo = periodo.substr(0, 4);
                           break;
                        case "CY":
                           periodo = texts.year_to_date;
                           break;
                        case "CYP":
                           periodo = texts.year_projection;
                           break;
                        case "B":
                           periodo = texts.budget;
                           break;
                        case "BTD":
                           periodo = texts.budget_to_date;
                           break;
                     }
                     var year= periodo;
                     if (yearList.indexOf(year)<0){
                        yearList.push(year);
                     }
                     var sumDebts= Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.stdc.debts.balance);
                     dataSerie1.push(sumDebts);
                     var sumAccr=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.stdc.accruals_and_deferred_income.balance);
                     dataSerie2.push(sumAccr);
                     var sumLtDebts=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.ltdc.longter_debts.balance);
                     dataSerie3.push(sumLtDebts);
                     var sumProv=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.ltdc.provisionsandsimilar.balance);
                     dataSerie4.push(sumProv); 
                     var sumOwnc=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.oc.ownbasecapital.balance);
                     dataSerie5.push(sumOwnc); 
                     var sumRese=Banana.SDecimal.abs(financialStatementAnalysis.data[i].balance.oc.reservesandprofits.balance);
                     dataSerie6.push(sumRese); 
                     
                     var sum = sumDebts;
                     sum = Banana.SDecimal.add(sumDebts, sum);
                     sum = Banana.SDecimal.add(sumAccr, sum);
                     sum = Banana.SDecimal.add(sumLtDebts, sum);
                     sum = Banana.SDecimal.add(sumProv, sum);
                     sum = Banana.SDecimal.add(sumOwnc, sum);
                     sum = Banana.SDecimal.add(sumRese, sum);
                     dataSum.push(sum);
                  }
                  dataSerie1 = convertToPerc(dataSerie1, dataSum);
                  dataSerie2 = convertToPerc(dataSerie2, dataSum);
                  dataSerie3 = convertToPerc(dataSerie3, dataSum);
                  dataSerie4 = convertToPerc(dataSerie4, dataSum);
                  dataSerie5 = convertToPerc(dataSerie5, dataSum);
                  dataSerie6 = convertToPerc(dataSerie6, dataSum);

                  chartData.labels = []
                  for (var i = 0; i < yearList.length; i++) {
                     var year = yearList[i];
                     chartData.labels.push(year);
                  }
                  chartData.datasets = [
                  {label: qsTr('Debts'), data: dataSerie1, backgroundColor:defaultColors[0].fill},
                  {label: qsTr('Accruals and Deferred Income'), data: dataSerie2, backgroundColor:defaultColors[1].fill},
                  {label: qsTr('Long term Debts'), data: dataSerie3, backgroundColor:defaultColors[2].fill},
                  {label: qsTr('Provisions and Similar'), data: dataSerie4, backgroundColor:defaultColors[3].fill},
                  {label: qsTr('Own base capital'), data: dataSerie5, backgroundColor:defaultColors[4].fill},
                  {label: qsTr('Reserves and Profits'), data: dataSerie6, backgroundColor:defaultColors[5].fill}
                  ]


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