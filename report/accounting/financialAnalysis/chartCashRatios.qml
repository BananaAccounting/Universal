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
               text: qsTr("Evolution of Cash Flow ratios")
               font.pixelSize: Stylesheet.titleFontSize
               Layout.bottomMargin: Stylesheet.defaultMargin
               Layout.alignment: Qt.AlignHCenter | Qt.AlignVCenter
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
                  var yearList = [];
                  var data = {};
                  data.cashflow_margin = {};
                  data.cashflow_asset_efficiency = {};
                  data.cashflow_current_liabilities = {};
                  data.cashflow_liabilities = {};
                  data.cashflow_to_investments = {};
                  for (var i = financialStatementAnalysis.data.length - 1; i >= 0; i--) {
                     var periodo = financialStatementAnalysis.data[i].period.StartDate;
                     //for dont cut the Budget string in Budg.
                     var elementType = financialStatementAnalysis.data[i].period.Type;
                     if (elementType === "Y") {
                        periodo = periodo.substr(0, 4);
                     }
                     var year= periodo;
                     if (year.length>0 && yearList.indexOf(year)<0)
                        yearList.push(year);
                     data.cashflow_margin[year] = financialStatementAnalysis.data[i].cashflow_index.cashflow_margin.amount;
                     data.cashflow_asset_efficiency [year] = financialStatementAnalysis.data[i].cashflow_index.cashflow_asset_efficiency.amount;
                     data.cashflow_current_liabilities[year] = financialStatementAnalysis.data[i].cashflow_index.cashflow_current_liabilities.amount;
                     data.cashflow_liabilities[year] = financialStatementAnalysis.data[i].cashflow_index.cashflow_liabilities.amount;
                     data.cashflow_to_investments[year] = financialStatementAnalysis.data[i].cashflow_index.cashflow_to_investments.amount;
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
                     chartData.datasets[i].data.push(data.cashflow_asset_efficiency [year]);
                     chartData.datasets[i].data.push(data.cashflow_current_liabilities[year]);
                     chartData.datasets[i].data.push(data.cashflow_liabilities[year]);
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