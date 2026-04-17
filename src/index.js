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
    theme: (() => {
    const t = Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    const smallView = window.devicePixelRatio >= 2
    if (!window.__lcjsDebugOverlay) {
        window.__lcjsDebugOverlay = document.createElement('div')
        window.__lcjsDebugOverlay.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;z-index:99999;font:12px monospace;pointer-events:none'
        if (document.body) document.body.appendChild(window.__lcjsDebugOverlay)
        setInterval(() => {
            if (!window.__lcjsDebugOverlay.parentNode && document.body) document.body.appendChild(window.__lcjsDebugOverlay)
            window.__lcjsDebugOverlay.textContent = window.innerWidth + 'x' + window.innerHeight + ' dpr=' + window.devicePixelRatio + ' small=' + (window.devicePixelRatio >= 2)
        }, 500)
    }
    return t && smallView ? lcjs.scaleTheme(t, 0.5) : t
})(),
textRenderer: window.devicePixelRatio >= 2 ? lcjs.htmlTextRenderer : undefined,
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
