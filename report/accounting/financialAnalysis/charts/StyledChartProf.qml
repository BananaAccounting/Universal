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
      }
   ]

   chartType: 'bar'; //Charts.ChartType.BAR;

   chartData: {
      'labels' : [
            "ROE","ROI","ROS","MOL"
            ],
      'datasets' : []
   }

   chartOptions : {
      'defaultFontSize' : 16,
      'legend':{
         'display': true,
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

   function showLoadingIndicator(show) {
      busyIndicator.running = show
   }
}

