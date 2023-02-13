/*
 * LightningChartJS example that showcases creation and styling of spline-series.
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Import xydata
const xydata = require('@arction/xydata')

// Extract required parts from LightningChartJS.
const { lightningChart, AxisTickStrategies, AxisScrollStrategies, PointShape, SolidFill, ColorHEX, Themes } = lcjs

const { createProgressiveRandomGenerator } = xydata
// Decide on an origin for DateTime axis.
const dateOrigin = new Date()
const dataFrequency = 1000
const chart = lightningChart().ChartXY({
    // theme: Themes.darkGold
})

chart
    .setTitle('Live power consumption')
    // Modify the default X Axis to use DateTime TickStrategy, and set the origin for the DateTime Axis.
    .getDefaultAxisX()
    .setTickStrategy(AxisTickStrategies.DateTime, (tickStrategy) => tickStrategy.setDateOrigin(dateOrigin))
    // Progressive DateTime view of 61 seconds.
    .setInterval({ start: -61 * 1000, end: 0, stopAxisAfter: false })
    .setScrollStrategy(AxisScrollStrategies.progressive)

chart
    .getDefaultAxisY()
    .setTitle('Power consumption (kW)')
    .setInterval({ start: 0, end: 500, stopAxisAfter: false })
    .setScrollStrategy(AxisScrollStrategies.expansion)

const series = chart
    .addSplineSeries({ pointShape: PointShape.Circle })
    .setName('Power consumption')
    .setCursorInterpolationEnabled(false)
    .setCursorResultTableFormatter((tableBuilder, series, x, y) =>
        tableBuilder
            .addRow(series.getName())
            .addRow(series.axisX.formatValue(x))
            .addRow(series.axisY.formatValue(y) + ' kW'),
    )

// Stream some random data.
createProgressiveRandomGenerator()
    .setNumberOfPoints(10000)
    .generate()
    .setStreamBatchSize(1)
    .setStreamInterval(1000)
    .setStreamRepeat(true)
    .toStream()
    .forEach((point) => {
        point.x = point.x * dataFrequency
        point.y = point.y * 2000
        series.add(point)
    })
