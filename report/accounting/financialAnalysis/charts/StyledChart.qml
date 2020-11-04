import QtQuick 2.14
import QtQuick.Controls 2.14
import QtQuick.Layouts 1.14

ChartView {

   property var defaultColors: [
      {
         'fill': 'false', //"#FF008DD2",
         'stroke': "#FF008D",
         'point': "#FF008D",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'false', //"#A09BD0E4",
         'stroke': "#A09BD0",
         'point': "#A09BD0",
         'pointStroke': "#FFFFFF"
      },
      {
         'fill': 'false', //"#A0AE6EFD",
         'stroke': "#A0AE6E",
         'point': "#A0AE6E",
         'pointStroke': "#FFFFFF"
      }
   ]

   chartType: 'bar'; //Charts.ChartType.BAR;

   chartData: {
      'labels' : [
            ],
       'datasets' : [
               {
                  'label': qsTr("Activated"),
                  'backgroundColor': defaultColors[0].fill,
                  'borderColor': defaultColors[0].stroke,
                  'pointBackgroundColor': defaultColors[0].point,
                  'pointBorderColor': defaultColors[0].pointStroke,
                  'data': []
               },
               {
                  'label': qsTr("Expired"),
                  'backgroundColor': defaultColors[1].fill,
                  'borderColor': defaultColors[1].stroke,
                  'pointBackgroundColor': defaultColors[1].point,
                  'pointBorderColor': defaultColors[1].pointStroke,
                  'data': []
               }
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
               return Banana.Converter.toLocaleNumberFormat(item.yLabel);
            }
         }
      },
      'scales': {
         'yAxes': [{
               'ticks': {
                  'beginAtZero' : true,
                  'callback': function(value, index, values) {
                     return Banana.Converter.toLocaleNumberFormat(value, 0)
                  }
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


