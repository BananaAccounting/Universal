import QtQuick 2.14

import "Chart.bundle.js" as ChartJs

Canvas {
   id: canvas;

   // ///////////////////////////////////////////////////////////////
   property var chartName;
   property var chart;
   property var chartData;
   property string chartType: 'line';
   property var chartOptions: ({})

   QtObject { // private implementation
      id: d
      property bool update: true
   }

   // /////////////////////////////////////////////////////////////////
   // Signals
   // /////////////////////////////////////////////////////////////////

   signal dataClicked(int column, int dataset, int mouseX, int mouseY);

   // /////////////////////////////////////////////////////////////////
   // Functions
   // /////////////////////////////////////////////////////////////////

   function repaintChart() {
      d.update = true
      canvas.requestPaint();
   }

   // /////////////////////////////////////////////////////////////////
   // Callbacks
   // /////////////////////////////////////////////////////////////////

   onPaint: {
      if (d.update) {
         var ctx = canvas.getContext("2d");
         ctx.clearRect(0, 0, width, height);
         var options = {
            type : chartType,
            data : chartData,
            options: chartOptions
         }
         chart = new Chart(ctx, options);
         d.update = false
      }

      chart.draw();
   }

   MouseArea {
      hoverEnabled : true
      anchors.fill: parent

      onPositionChanged: {
         var event = {
            type: "mousemove",
            currentTarget: canvas.contex,
            srcElement: canvas.contex,
            clientX: mouse.x,
            clientY: mouse.y
         };
         canvas.chart.eventHandler(event);
         canvas.requestPaint();
      }

      onClicked:{
         var event = {
            type: "click",
            currentTarget: chart,
            srcElement: chart,
            clientX: mouse.x,
            clientY: mouse.y
         }
         var res= chart.getElementAtEvent(event);
         if (res.length > 0) {
            console.info( " clicked: column("+res[0]._index+") dataset("+res[0]._datasetIndex+")")
            dataClicked(res[0]._index, res[0]._datasetIndex, mouse.x, mouse.y)
         } else {
            res = chart.getElementsAtXAxis(event);
            if (res.length>0) {
               console.info( " clicked: column("+res[0]._index+")");
               dataClicked(res[0]._index, -1, mouse.x, mouse.y)
            }
         }
      }

      onExited: {
         var event = {
            type: "mouseout",
            currentTarget: canvas.contex,
            srcElement: canvas.contex,
            clientX: 0,
            clientY: 0
         };
         canvas.chart.eventHandler(event);
         canvas.requestPaint();
      }
   }

}
