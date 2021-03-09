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
               text: qsTr("Cashflow index variation")
               font.pixelSize: Stylesheet.titleFontSize
               Layout.bottomMargin: Stylesheet.defaultMargin
            }

            StyledChartCashRatio {
               id: mainChart
               height: availableHeight
               width: availableWidth
               Layout.fillWidth: true
               Layout.fillHeight: true

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
                  financialStatementAnalysis.calculateCashflowDelta();
                  var transactions_amounts=financialStatementAnalysis.loadAmountsFromTransactions();
                  var cashflow_investments=financialStatementAnalysis.calculateCashflowInvestments(transactions_amounts);
                  var gross_casshflow=financialStatementAnalysis.calculateGrossCashflow();
                  var net_casshflow=financialStatementAnalysis.calculateNetCashflow(gross_casshflow,transactions_amounts);
                  var free_casshflow=financialStatementAnalysis.calculateFreeCashflow(cashflow_investments, net_casshflow,transactions_amounts);
                  var cashflow_index=financialStatementAnalysis.calculateCashflowIndex(free_casshflow,cashflow_investments);
                  var yearList = [];
                  var data = {};
                  data.cashflow_margin = {};
                  data.cashflow_to_debt = {};
                  data.cashflow_to_investments = {};

                  for (var i = financialStatementAnalysis.data.length - 2; i >= 0; i--) {
                     var periodo = financialStatementAnalysis.data[i].period.StartDate;
                     //for dont cut the Budget string in Budg.
                     var elementType = financialStatementAnalysis.data[i].period.Type;
                     if (elementType === "Y") {
                        periodo = periodo.substr(0, 4);
                     }
                     var year= periodo;
                     if (year.length>0 && yearList.indexOf(year)<0)
                        yearList.push(year);
                        data.cashflow_margin[year] = cashflow_index.cashflow_margin.amount[i];
                        data.cashflow_to_debt[year] = cashflow_index.cashflow_to_debt.amount[i];
                        data.cashflow_to_investments[year] = cashflow_index.cashflow_to_investments.amount[i];
                  }
                  for (var i = 0; i < yearList.length; i++) {
                     var year = yearList[i];
                     chartData.datasets[i] = {};
                     chartData.datasets[i].label = year;
                     var defaultColor = defaultColors[0].fill;
                     if (i < defaultColors.length)
                        defaultColor = defaultColors[i].fill;
                     chartData.datasets[i].backgroundColor = defaultColor;
                     chartData.datasets[i].data = [];
                     chartData.datasets[i].data.push(data.cashflow_margin[year]);
                     chartData.datasets[i].data.push(data.cashflow_to_debt[year]);
                     chartData.datasets[i].data.push(data.cashflow_to_investments[year]);
                  }  
                  
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