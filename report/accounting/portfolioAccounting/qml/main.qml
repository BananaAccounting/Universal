import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    width: 980
    height: 680

    property var dashboard: getPortfolioDashboardData(Banana.document)
    property color pageBg: "#eef2f5"
    property color panelBg: "#ffffff"
    property color lineColor: "#d8dee6"
    property color textStrong: "#17202a"
    property color textSoft: "#687385"
    property color accent: "#147d7e"
    property color accentSoft: "#d9f0ee"
    property color gainColor: "#168048"
    property color lossColor: "#bf3f3f"
    property color warnColor: "#b7791f"
    property bool securityChartVisible: false
    property var selectedSecurityHistory: ({})

    function safeText(value, fallback) {
        if (value === undefined || value === null || value === "")
            return fallback
        return value
    }

    function metricColor(value) {
        var text = String(value || "")
        if (text.indexOf("-") === 0)
            return lossColor
        if (text.indexOf("+") === 0)
            return gainColor
        return textStrong
    }

    function barWidth(percent, width) {
        var value = Number(percent || 0)
        if (value < 0)
            value = 0
        if (value > 100)
            value = 100
        return width * value / 100
    }

    function openSecurityChart(itemId) {
        selectedSecurityHistory = getSecurityAverageCostHistory(Banana.document, itemId)
        securityChartVisible = true
    }

    function closeSecurityChart() {
        securityChartVisible = false
        selectedSecurityHistory = ({})
    }

    Rectangle {
        anchors.fill: parent
        color: root.pageBg

        ScrollView {
            anchors.fill: parent
            clip: true

            ColumnLayout {
                width: Math.max(root.width, 920)
                spacing: 14

                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 132
                    color: "#17313b"

                    RowLayout {
                        anchors.fill: parent
                        anchors.margins: 22
                        spacing: 20

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 7

                            Label {
                                text: "Portfolio dashboard"
                                color: "#ffffff"
                                font.pixelSize: 26
                                font.bold: true
                            }

                            Label {
                                text: "As of " + safeText(root.dashboard.asOfDate, "-") + " - Base currency " + safeText(root.dashboard.baseCurrency, "-")
                                color: "#c8d4dc"
                                font.pixelSize: 13
                            }

                            RowLayout {
                                spacing: 22

                                SmallFact {
                                    label: "Securities"
                                    value: safeText(root.dashboard.totals.securitiesCount, "0")
                                }

                                SmallFact {
                                    label: "Currencies"
                                    value: safeText(root.dashboard.totals.currenciesCount, "0")
                                }

                                SmallFact {
                                    label: "Accounts"
                                    value: safeText(root.dashboard.totals.accountsCount, "0")
                                }
                            }
                        }

                        ColumnLayout {
                            Layout.alignment: Qt.AlignRight | Qt.AlignVCenter
                            spacing: 4

                            Label {
                                Layout.alignment: Qt.AlignRight
                                text: safeText(root.dashboard.totals.marketValueFmt, "0")
                                color: "#ffffff"
                                font.pixelSize: 30
                                font.bold: true
                            }

                            Label {
                                Layout.alignment: Qt.AlignRight
                                text: "Current market value"
                                color: "#c8d4dc"
                                font.pixelSize: 12
                            }
                        }
                    }
                }

                GridLayout {
                    Layout.fillWidth: true
                    Layout.leftMargin: 16
                    Layout.rightMargin: 16
                    columns: 4
                    rowSpacing: 12
                    columnSpacing: 12

                    KpiCard {
                        title: "Book value"
                        value: safeText(root.dashboard.totals.bookValueFmt, "0")
                        detail: "Carrying amount"
                        tone: root.textStrong
                    }

                    KpiCard {
                        title: "Unrealized G/L"
                        value: safeText(root.dashboard.totals.unrealizedGainLossFmt, "0")
                        detail: safeText(root.dashboard.totals.unrealizedGainLossPercentFmt, "0%")
                        tone: root.metricColor(root.dashboard.totals.unrealizedGainLossFmt)
                    }

                    KpiCard {
                        title: "Market prices"
                        value: safeText(root.dashboard.totals.missingPricesCount, "0")
                        detail: "Missing current prices"
                        tone: Number(root.dashboard.totals.missingPricesCount || 0) > 0 ? root.warnColor : root.gainColor
                    }

                    KpiCard {
                        title: "Allocation"
                        value: safeText(root.dashboard.totals.currenciesCount, "0")
                        detail: "Currency buckets"
                        tone: root.accent
                    }
                }

                GridLayout {
                    Layout.fillWidth: true
                    Layout.leftMargin: 16
                    Layout.rightMargin: 16
                    columns: 2
                    rowSpacing: 12
                    columnSpacing: 12

                    Panel {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 320
                        heading: "Currency allocation"

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            anchors.topMargin: 50
                            spacing: 10

                            Repeater {
                                model: root.dashboard.currencies

                                AllocationRow {
                                    rowData: modelData
                                    barColor: root.accent
                                }
                            }
                        }
                    }

                    Panel {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 320
                        heading: "Account allocation"

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 16
                            anchors.topMargin: 50
                            spacing: 10

                            Repeater {
                                model: root.dashboard.accounts

                                AllocationRow {
                                    rowData: modelData
                                    barColor: "#5f6f89"
                                }
                            }
                        }
                    }
                }

                Panel {
                    Layout.fillWidth: true
                    Layout.leftMargin: 16
                    Layout.rightMargin: 16
                    Layout.preferredHeight: 270
                    heading: "Top holdings"

                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 16
                        anchors.topMargin: 52
                        spacing: 0

                        RowLayout {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 28
                            spacing: 10

                            HeaderCell { Layout.fillWidth: true; text: "Security" }
                            HeaderCell { Layout.preferredWidth: 120; text: "Currency value" }
                            HeaderCell { Layout.preferredWidth: 120; text: "Base value" }
                            HeaderCell { Layout.preferredWidth: 96; text: "Weight" }
                            HeaderCell { Layout.preferredWidth: 120; text: "Unrealized G/L" }
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            Layout.preferredHeight: 1
                            color: root.lineColor
                        }

                        Repeater {
                            model: root.dashboard.topHoldings

                            HoldingRow {
                                rowData: modelData
                                onClicked: root.openSecurityChart(rowData.item)
                            }
                        }
                    }
                }

                Item {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 16
                }
            }
        }

        Rectangle {
            anchors.fill: parent
            visible: root.securityChartVisible
            color: "#80000000"
            z: 10

            MouseArea {
                anchors.fill: parent
                onClicked: root.closeSecurityChart()
            }

            Rectangle {
                anchors.centerIn: parent
                width: Math.min(parent.width - 48, 840)
                height: Math.min(parent.height - 48, 560)
                radius: 8
                color: root.panelBg
                border.width: 1
                border.color: root.lineColor

                MouseArea {
                    anchors.fill: parent
                    onClicked: mouse.accepted = true
                }

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 18
                    spacing: 14

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 12

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 3

                            Label {
                                text: safeText(root.selectedSecurityHistory.description, "-")
                                color: root.textStrong
                                font.pixelSize: 21
                                font.bold: true
                                elide: Text.ElideRight
                            }

                            Label {
                                text: safeText(root.selectedSecurityHistory.item, "-") + " - " + safeText(root.selectedSecurityHistory.currency, "-")
                                color: root.textSoft
                                font.pixelSize: 12
                            }
                        }

                        Button {
                            text: "Close"
                            onClicked: root.closeSecurityChart()
                        }
                    }

                    GridLayout {
                        Layout.fillWidth: true
                        columns: 4
                        columnSpacing: 10

                        DetailMetric {
                            title: "Latest avg cost"
                            value: safeText(root.selectedSecurityHistory.latestValueFmt, "-")
                        }

                        DetailMetric {
                            title: "Latest date"
                            value: safeText(root.selectedSecurityHistory.latestDateFmt, "-")
                        }

                        DetailMetric {
                            title: "Quantity"
                            value: safeText(root.selectedSecurityHistory.latestQuantityFmt, "-")
                        }

                        DetailMetric {
                            title: "Points"
                            value: root.selectedSecurityHistory.points ? String(root.selectedSecurityHistory.points.length) : "0"
                        }
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        radius: 7
                        color: "#f8fafb"
                        border.width: 1
                        border.color: root.lineColor

                        AverageCostChart {
                            anchors.fill: parent
                            anchors.margins: 16
                            historyData: root.selectedSecurityHistory
                        }
                    }
                }
            }
        }
    }

    component SmallFact: ColumnLayout {
        property string label: ""
        property string value: ""
        spacing: 1

        Label {
            text: value
            color: "#ffffff"
            font.pixelSize: 16
            font.bold: true
        }

        Label {
            text: label
            color: "#b8c8d0"
            font.pixelSize: 11
        }
    }

    component KpiCard: Rectangle {
        property string title: ""
        property string value: ""
        property string detail: ""
        property color tone: root.textStrong

        Layout.fillWidth: true
        Layout.preferredHeight: 104
        radius: 7
        color: root.panelBg
        border.width: 1
        border.color: root.lineColor

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 14
            spacing: 4

            Label {
                text: title
                color: root.textSoft
                font.pixelSize: 12
                font.bold: true
            }

            Label {
                Layout.fillWidth: true
                text: value
                color: tone
                font.pixelSize: 22
                font.bold: true
                elide: Text.ElideRight
            }

            Label {
                text: detail
                color: root.textSoft
                font.pixelSize: 12
            }
        }
    }

    component Panel: Rectangle {
        property string heading: ""

        radius: 7
        color: root.panelBg
        border.width: 1
        border.color: root.lineColor

        Label {
            x: 16
            y: 15
            text: heading
            color: root.textStrong
            font.pixelSize: 16
            font.bold: true
        }
    }

    component AllocationRow: Item {
        property var rowData
        property color barColor: root.accent

        Layout.fillWidth: true
        Layout.preferredHeight: 48

        ColumnLayout {
            anchors.fill: parent
            spacing: 5

            RowLayout {
                Layout.fillWidth: true
                spacing: 8

                Label {
                    Layout.fillWidth: true
                    text: rowData.name
                    color: root.textStrong
                    font.pixelSize: 13
                    font.bold: true
                    elide: Text.ElideRight
                }

                Label {
                    text: rowData.weightPercentFmt
                    color: root.textSoft
                    font.pixelSize: 12
                }
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 8
                radius: 4
                color: "#e5eaef"

                Rectangle {
                    width: root.barWidth(rowData.weightPercent, parent.width)
                    height: parent.height
                    radius: 4
                    color: barColor
                }
            }

            RowLayout {
                Layout.fillWidth: true
                spacing: 8

                Label {
                    Layout.fillWidth: true
                    text: rowData.marketValueFmt
                    color: root.textSoft
                    font.pixelSize: 11
                    elide: Text.ElideRight
                }

                Label {
                    text: rowData.unrealizedGainLossFmt + " (" + rowData.gainLossPercentFmt + ")"
                    color: root.metricColor(rowData.unrealizedGainLossFmt)
                    font.pixelSize: 11
                }
            }
        }
    }

    component HeaderCell: Label {
        color: root.textSoft
        font.pixelSize: 11
        font.bold: true
        elide: Text.ElideRight
    }

    component HoldingRow: Item {
        property var rowData
        signal clicked

        Layout.fillWidth: true
        Layout.preferredHeight: 34

        Rectangle {
            anchors.fill: parent
            color: rowMouse.containsMouse ? "#f3f7f8" : "transparent"
            radius: 4
        }

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 4
            anchors.rightMargin: 4
            spacing: 10

            Label {
                Layout.fillWidth: true
                text: rowData.description + " (" + rowData.item + ")"
                color: root.textStrong
                font.pixelSize: 12
                elide: Text.ElideRight
            }

            Label {
                Layout.preferredWidth: 120
                text: rowData.marketValueCurrencyFmt
                color: root.textSoft
                font.pixelSize: 12
                horizontalAlignment: Text.AlignRight
                elide: Text.ElideRight
            }

            Label {
                Layout.preferredWidth: 120
                text: rowData.marketValueBaseFmt
                color: root.textStrong
                font.pixelSize: 12
                horizontalAlignment: Text.AlignRight
                elide: Text.ElideRight
            }

            Label {
                Layout.preferredWidth: 96
                text: rowData.weightPercentFmt
                color: root.textSoft
                font.pixelSize: 12
                horizontalAlignment: Text.AlignRight
            }

            Label {
                Layout.preferredWidth: 120
                text: rowData.unrealizedGainLossBaseFmt
                color: root.metricColor(rowData.unrealizedGainLossBaseFmt)
                font.pixelSize: 12
                horizontalAlignment: Text.AlignRight
                elide: Text.ElideRight
            }
        }

        MouseArea {
            id: rowMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: parent.clicked()
        }
    }

    component DetailMetric: Rectangle {
        property string title: ""
        property string value: ""

        Layout.fillWidth: true
        Layout.preferredHeight: 64
        radius: 6
        color: "#f8fafb"
        border.width: 1
        border.color: root.lineColor

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 10
            spacing: 3

            Label {
                text: title
                color: root.textSoft
                font.pixelSize: 11
                font.bold: true
            }

            Label {
                Layout.fillWidth: true
                text: value
                color: root.textStrong
                font.pixelSize: 15
                font.bold: true
                elide: Text.ElideRight
            }
        }
    }

    component AverageCostChart: Canvas {
        property var historyData

        onHistoryDataChanged: requestPaint()
        onWidthChanged: requestPaint()
        onHeightChanged: requestPaint()

        function chartPoints() {
            if (!historyData || !historyData.points)
                return []
            return historyData.points
        }

        onPaint: {
            var ctx = getContext("2d")
            ctx.clearRect(0, 0, width, height)

            var points = chartPoints()
            var leftPad = 54
            var rightPad = 18
            var topPad = 24
            var bottomPad = 46
            var chartW = width - leftPad - rightPad
            var chartH = height - topPad - bottomPad

            ctx.fillStyle = "#f8fafb"
            ctx.fillRect(0, 0, width, height)

            ctx.strokeStyle = "#d8dee6"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(leftPad, topPad)
            ctx.lineTo(leftPad, topPad + chartH)
            ctx.lineTo(leftPad + chartW, topPad + chartH)
            ctx.stroke()

            ctx.fillStyle = root.textSoft
            ctx.font = "11px sans-serif"

            if (points.length < 1) {
                ctx.fillText("No average cost history available", leftPad, topPad + 28)
                return
            }

            var minV = Number(historyData.minValue || 0)
            var maxV = Number(historyData.maxValue || 0)
            if (maxV === minV) {
                maxV = maxV + 1
                minV = Math.max(0, minV - 1)
            }

            for (var g = 0; g <= 4; g++) {
                var y = topPad + chartH * g / 4
                ctx.strokeStyle = "#e8edf1"
                ctx.beginPath()
                ctx.moveTo(leftPad, y)
                ctx.lineTo(leftPad + chartW, y)
                ctx.stroke()
            }

            ctx.fillStyle = root.textSoft
            ctx.fillText(safeText(historyData.maxValueFmt, ""), 4, topPad + 4)
            ctx.fillText(safeText(historyData.minValueFmt, ""), 4, topPad + chartH)

            function xFor(index) {
                if (points.length === 1)
                    return leftPad + chartW / 2
                return leftPad + chartW * index / (points.length - 1)
            }

            function yFor(value) {
                return topPad + chartH - ((Number(value) - minV) / (maxV - minV)) * chartH
            }

            ctx.strokeStyle = root.accent
            ctx.lineWidth = 2
            ctx.beginPath()
            for (var i = 0; i < points.length; i++) {
                var x = xFor(i)
                var yPoint = yFor(points[i].value)
                if (i === 0)
                    ctx.moveTo(x, yPoint)
                else
                    ctx.lineTo(x, yPoint)
            }
            ctx.stroke()

            for (var p = 0; p < points.length; p++) {
                var px = xFor(p)
                var py = yFor(points[p].value)
                ctx.fillStyle = root.panelBg
                ctx.strokeStyle = root.accent
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.arc(px, py, 4, 0, Math.PI * 2)
                ctx.fill()
                ctx.stroke()
            }

            var first = points[0]
            var last = points[points.length - 1]
            ctx.fillStyle = root.textSoft
            ctx.font = "11px sans-serif"
            ctx.fillText(safeText(first.dateFmt, ""), leftPad, height - 18)
            var lastLabel = safeText(last.dateFmt, "")
            ctx.fillText(lastLabel, leftPad + chartW - ctx.measureText(lastLabel).width, height - 18)

            ctx.fillStyle = root.textStrong
            ctx.font = "12px sans-serif"
            var latestText = "Latest: " + safeText(last.valueFmt, "-") + " " + safeText(historyData.currency, "")
            ctx.fillText(latestText, leftPad, topPad - 7)
        }
    }
}
