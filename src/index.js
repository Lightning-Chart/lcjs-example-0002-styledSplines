/*
 * LightningChartJS example that showcases creation and styling of spline-series.
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

// Import xydata
const xydata = require('@lightningchart/xydata')

// Extract required parts from LightningChartJS.
const { lightningChart, AxisTickStrategies, AxisScrollStrategies, PointShape, SolidFill, ColorHEX, Themes } = lcjs
const { createProgressiveRandomGenerator } = xydata

// Decide on an origin for DateTime axis.
const dateOrigin = new Date()
const dateOriginTime = dateOrigin.getTime()

const chart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        }).ChartXY({
    legend: { visible: false },
    theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
})

chart
    .setTitle('Live power consumption')
    // Modify the default X Axis to use DateTime TickStrategy, and set the origin for the DateTime Axis.
    .getDefaultAxisX()
    .setTickStrategy(AxisTickStrategies.DateTime, (tickStrategy) => tickStrategy.setDateOrigin(dateOrigin))
    // Progressive DateTime view of 61 seconds.
    .setDefaultInterval((state) => ({ end: state.dataMax, start: (state.dataMax ?? 0) - 61 * 1000, stopAxisAfter: false }))
    .setScrollStrategy(AxisScrollStrategies.scrolling)

chart.axisY
    .setTitle('Power consumption')
    .setUnits('kW')
    .setInterval({ start: 0, end: 500, stopAxisAfter: false })
    .setScrollStrategy(AxisScrollStrategies.expansion)

const series = chart
    .addPointLineAreaSeries({
        schema: {
            x: { pattern: 'progressive' },
            y: { pattern: null },
        },
    })
    .setCurvePreprocessing({ type: 'spline' })
    .setName('Power consumption')

// Stream some random data.
createProgressiveRandomGenerator()
    .setNumberOfPoints(10000)
    .generate()
    .setStreamBatchSize(1)
    .setStreamInterval(1000)
    .setStreamRepeat(true)
    .toStream()
    .forEach((point) => {
        point.x = Date.now() - dateOriginTime
        point.y = point.y * 2000
        series.appendSample(point)
    })
