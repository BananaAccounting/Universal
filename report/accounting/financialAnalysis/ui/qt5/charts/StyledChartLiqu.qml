import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

ChartView {

   property var defaultColors: [
      {
         'fill': 'rgba(128, 168, 255, 0.8)', //75%
         'stroke': "#3333cc",
         'point': "#FF008D",
         'pointStroke': "#FF008D"
      },
      {
         'fill': 'rgba(77, 133, 255, 0.8)',//65%
         'stroke': "#000066",
         'point': "#000066",
         'pointStroke': "#000066"
      },
      {
         'fill': 'rgba(26, 98, 255, 0.8)',//55%
         'stroke': "#A0AE6E",
         'point': "#A0AE6E",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'rgba(0, 73, 230, 0.8)',//45% 
         'stroke': "#3333cc",
         'point': "#FF008D",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'rgba(0, 57, 179, 0.8)', //35%
         'stroke': "#3333cc",
         'point': "#FF008D",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'rgba(0, 40, 128, 0.8)', //25%
         'stroke': "#3333cc",
         'point': "#FF008D",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'rgba(0, 24, 77, 0.8)', //15%
         'stroke': "#A0AE6E",
         'point': "#A0AE6E",
         'pointStroke': "#FFFFFF"
      }
   ]

   chartType: 'bar'; //Charts.ChartType.BAR;

   chartData: {
      'labels' : [
            qsTr("Cash ratio"),qsTr("Quick ratio"),qsTr("Current ratio")
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
         'intersect': false,
         'titleFontSize': 16,
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
               return Banana.Converter.toLocaleNumberFormat(item.yLabel) + '%';
            }
         }
      },
      'scales': {
         'yAxes': [{
               'ticks': {
               callback: function (value) {
               return value+"%";
               },
                  'beginAtZero' : true,
               }
            }]
      }
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


