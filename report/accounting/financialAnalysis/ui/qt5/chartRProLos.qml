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
               text: qsTr("Reclassified Profit and Loss")
               font.pixelSize: Stylesheet.titleFontSize
               Layout.bottomMargin: Stylesheet.defaultMargin
               Layout.alignment: Qt.AlignHCenter | Qt.AlignVCenter
            }

            StyledChartRProLos {
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
                  var savedParam=Banana.document.getScriptSettings("financialStatementAnalysis");
                  if (savedParam.length > 0) {
                     var param = JSON.parse(savedParam);
                     financialStatementAnalysis.setParam(param);
                  }
                  financialStatementAnalysis.loadData();
                  var texts=financialStatementAnalysis.initFinancialAnalysisTexts();
                  var yearList = [];
                  var data = {};
                  data.adva = {};
                  data.ebitda = {};
                  data.ebit = {};
                  data.ebt = {};
                  data.tota = {};
                  for (var i = financialStatementAnalysis.data.length - 1; i >= 0; i--) {
                     var periodo = financialStatementAnalysis.data[i].period.StartDate;
                     //for dont cut the Budget string in Budg.
                     var periodType = financialStatementAnalysis.data[i].period.Type;
                     if(periodType !=="BDT" && periodType !=="BDC"){
                        switch(periodType) {
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
                        var year=periodo;
                        if (year.length>0 && yearList.indexOf(year)<0)
                           yearList.push(year);
                        data.adva[year] = financialStatementAnalysis.data[i].calculated_data.addedvalue;
                        data.ebitda[year] = financialStatementAnalysis.data[i].calculated_data.ebitda;
                        data.ebit[year] = financialStatementAnalysis.data[i].calculated_data.ebit;
                        data.ebt[year] = financialStatementAnalysis.data[i].calculated_data.ebt;
                        data.tota[year] = financialStatementAnalysis.data[i].calculated_data.annualresult;
                     }
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
                     chartData.datasets[i].data.push(data.adva[year]);
                     chartData.datasets[i].data.push(data.ebitda[year]);
                     chartData.datasets[i].data.push(data.ebit[year]);
                     chartData.datasets[i].data.push(data.ebt[year]);
                     chartData.datasets[i].data.push(data.tota[year]);
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