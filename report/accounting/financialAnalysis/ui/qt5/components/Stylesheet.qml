pragma Singleton

import QtQml 2.14

QtObject {
   property double displayScaling: 1.0

   property int titleFontSize: 16 * displayScaling
   property int descriptionFontSize: 12 * displayScaling

   property int defaultMargin: titleFontSize * 0.625

   property string currentSelectionColor: "LightSteelBlue"
   property string tabBarBorderColor: "grey"

}
