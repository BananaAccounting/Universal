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
               text: qsTr("Financing index variation")
               font.pixelSize: Stylesheet.titleFontSize
               Layout.bottomMargin: Stylesheet.defaultMargin
            }

            StyledChartFin {
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
                  financialStatementAnalysis.loadData();
                  var yearList = [];
                  var data = {};
                  data.grcuas = {};
                  data.grfixa = {};
                  data.gdin = {};
                  data.gfcp = {};
                  data.gdau = {};
                  data.fixaco = {};

                  for (var i = 0; i < financialStatementAnalysis.data.length; i++) {
                     var periodo = financialStatementAnalysis.data[i].period.StartDate;
                     if (periodo.length<4)
                        continue;
                     var year = periodo.substr(0, 4);
                     if (year.length>0 && yearList.indexOf(year)<0)
                        yearList.push(year);
                     data.grcuas[year] = financialStatementAnalysis.data[i].index.fin.grcuas.amount;
                     data.grfixa[year] = financialStatementAnalysis.data[i].index.fin.grfixa.amount;
                     data.gdin[year] = financialStatementAnalysis.data[i].index.fin.gdin.amount;
                     data.gfcp[year] = financialStatementAnalysis.data[i].index.fin.gfcp.amount;
                     data.gdau[year] = financialStatementAnalysis.data[i].index.fin.gdau.amount;
                     data.fixaco[year] = financialStatementAnalysis.data[i].index.fin.fixaco.amount;
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
                     chartData.datasets[i].data.push(data.grcuas[year]);
                     chartData.datasets[i].data.push(data.grfixa[year] );
                     chartData.datasets[i].data.push(data.gdin[year]);
                     chartData.datasets[i].data.push(data.gfcp[year]);
                     chartData.datasets[i].data.push(data.gdau[year]);
                     chartData.datasets[i].data.push(data.fixaco[year]);
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