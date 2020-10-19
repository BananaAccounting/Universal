import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

ChartView {

   property var defaultColors: [
      {
         'fill': 'rgba(0, 0, 204, 0.4)', 
         'stroke': "#3333cc",
         'point': "#FF008D",
         'pointStroke': "#FF008D"
      },
      {
         'fill': 'rgba(102, 255, 102, 0.4)',
         'stroke': "#000066",
         'point': "#000066",
         'pointStroke': "#000066"
      },
      {
         'fill': 'rgba(255, 0, 0, 0.4)',
         'stroke': "#A0AE6E",
         'point': "#A0AE6E",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'rgba(255, 153, 51, 0.4)', 
         'stroke': "#3333cc",
         'point': "#FF008D",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'rgba(0, 204, 255, 0.4)',
         'stroke': "#000066",
         'point': "#000066",
         'pointStroke': "#000066"
      },
      {
         'fill': 'rgba(255, 204, 0, 0.4)',
         'stroke': "#A0AE6E",
         'point': "#A0AE6E",
         'pointStroke': "#FFFFFF"
      }
   ]

   chartType: 'bar'; //Charts.ChartType.BAR;

   chartData: {
      'labels' : [
           qsTr("degree of circulating active"),qsTr("Percentage fixed assets"),qsTr("Debt ratio"),qsTr("Equity ratio"),qsTr("self financing ratio"),qsTr("fixed asset coverage")
      ],
       'datasets' : [
       ]
   }

   chartOptions : {
      'defaultFontSize' : 16,
      'legend':{
         'display': false,
      },
      'tooltips': {
         'mode': 'index',
         'intersect': true,
         'titleFontSize': 18,
         'bodyFontSize': 14,
         'callbacks': {
            'labelColor' : function(tooltipItem, chart) {
               var dataset = chart.config.data.datasets[tooltipItem.datasetIndex];
               var color = dataset.backgroundColor;
               return {
                  borderColor: color,
                  backgroundColor: color
               }
            },
            'label' : function(item, data){
               return Banana.Converter.toLocaleNumberFormat(item.yLabel);
            }
         }
      },
      'scales': {
         'yAxes': [{
               'ticks': {
               callback: function (value) {
               return value+"%";
               },
                  'beginAtZero' : true
               }
            }]
      },
      'barValueSpacing': 20,
   }

   BusyIndicator {
      id: busyIndicator
      running: false
      anchors.horizontalCenter: parent.horizontalCenter
      anchors.verticalCenter: parent.verticalCenter
   }

   onCanvasSizeChanged: {
      repaintChart()
   }

   function setDatasets(labels) {
      if (labels.length > 1)
         chartOptions.legend.display = true

      chartData.datasets = []
      for (var i = 0; i < labels.length; i++)  {
         chartData.datasets.push(
                  {
                     'label' : labels[i],
                     'backgroundColor': defaultColors[i].fill,
                     'borderColor': defaultColors[i].stroke,
                     'pointBackgroundColor': defaultColors[i].point,
                     'pointBorderColor': defaultColors[i].pointStroke,
                     'data': []
                  }
                  )
      }
   }

   function showLoadingIndicator(show) {
      busyIndicator.running = show
   }
}


