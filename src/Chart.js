import React, {Component} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import './Chart.css';
import { CbProAPI } from './CbProAPI';

// colors
const fg = 'rgb(230, 230, 230)';
const fgDarker = 'rgb(150, 150, 150)';
const bg = 'rgb(20, 20, 36)';
const green = 'rgb(20, 180, 140)';
const red = 'rgb(250, 70, 90)';
const bgYellow = 'rgb(255, 255, 0)';

// theme
function am4themes_dark(target) {

    if (target instanceof am4core.InterfaceColorSet) {
        
        target.setFor('background',             am4core.color(bg));
        target.setFor('alternativeBackground',  am4core.color(bgYellow));

        target.setFor('primaryButton',        am4core.color(bg));
        target.setFor('primaryButtonHover',   am4core.color(bg));
        target.setFor('primaryButtonActive',  am4core.color(bg));

        target.setFor('secondaryButton',        am4core.color(bg));
        target.setFor('secondaryButtonHover',   am4core.color(bg));
        target.setFor('secondaryButtonActive',  am4core.color(bg));
        target.setFor('secondaryButtonStroke',  am4core.color(fg));

        target.setFor('grid',       am4core.color(fg));
        target.setFor('text',       am4core.color(fgDarker));

        target.setFor('positive',   am4core.color(green));
        target.setFor('negative',   am4core.color(red));
    }
}

am4core.useTheme(am4themes_dark);
am4core.options.onlyShowOnViewport = true; // optimization: draw only visible part first

class Chart extends Component {

    // constructor
    constructor(props) {

        super(props);

        // constants
        this.timeGridUnit = 50; // pixels
        this.priceGridUnit = 30; // pixels
        this.volAxisHeight = am4core.percent(20);
        this.volSeriesOpacity = 0.5; // 50%
        this.tooltipDx = -5; // pixels
        this.tooltipFontSize = 14;
        this.preZoomLevel = 0.5; // 50%

        // states
        this.state = {
            timeUnit: 1, // minutes
            showSMA: true
        };
    }

    componentDidMount() {
        this.setupChart();
        this.loadInitialData();
        this.setupAxes();
        this.setupDataSerieses();        
    }

    componentWillUnmount() {
        if (this.chart)
            this.chart.dispose();
    }

    componentDidUpdate(oldProps) {

        let currentTime = new Date();

        // add new candle every minute
        if ((this.props.price !== undefined) && this.chart.data[0] && (currentTime.getMinutes() !== this.chart.data[0].time.getMinutes())) {

            // add new candle
            this.chart.data.unshift({
                time: currentTime,
                low: this.props.price,
                high: this.props.price,
                open: this.props.price,
                close: this.props.price
                // no volume
            });

            // remove the oldest candle
            this.chart.data.pop();

            // update chart
            this.chart.invalidateData();
        }
        else {
            // update current candle when price changes
            if (oldProps.price !== this.props.price) {

                // update close
                this.chart.data[0].close = this.props.price;

                // update low and high
                if (this.props.price < this.chart.data[0].low)
                    this.chart.data[0].low = this.props.price;
                else if (this.props.price > this.chart.data[0].high)
                    this.chart.data[0].high = this.props.price;

                // update chart
                this.chart.invalidateRawData();
            }

            // update last minute's candle at 30 seconds (to get the volume)
            if (currentTime.getSeconds() === 30) {

                // request last minute's candle
                CbProAPI.loadCandle()
                .then(candle => {
                    // if it differs from chart data
                    if ((this.chart.data[1].highVolume !== candle.highVolume)) {
                        // update volume
                        this.chart.data[1].openVolume =  candle.openVolume;
                        this.chart.data[1].valueVolume = candle.valueVolume;
                        this.chart.data[1].highVolume = candle.highVolume;
                        // redraw
                        this.chart.invalidateRawData();
                    }
                })
                .catch(err => {
                    console.error('[Client] ' + err);
                })
            }
        }
    }

    setupChart() {

        this.chart = am4core.create("priceChart", am4charts.XYChart);
        this.chart.responsive.enabled = true;
        this.chart.padding(15, 15, 0, 0); // padding (pixels)
        this.chart.dateFormatter.dateFormat = 'HH:mm'; // date format

        // cursor
        this.chart.cursor = new am4charts.XYCursor();
        this.chart.cursor.behavior = 'selectY';

        // theme
        this.chart.background.show();
        this.chart.cursor.lineX.strokeOpacity = 1;
        this.chart.cursor.lineX.strokeDasharray = [];
        this.chart.cursor.lineX.strokeWidth = 1;
        this.chart.cursor.lineY.strokeOpacity = 1;
        this.chart.cursor.lineY.strokeDasharray = [];
        this.chart.cursor.lineY.strokeWidth = 1;
    }

    loadInitialData() {
        // load initial data (history candles)
        CbProAPI.loadHistory()
        .then(data => { 
            this.chart.data = data;
        })
        .catch(err => { 
            console.error('[Client] ' + err); 
        });
    }

    setupAxes() {

        this.chart.leftAxesContainer.layout = 'vertical' // separates axes vertically


        // axes

        let timeAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        timeAxis.renderer.grid.template.location = 0;
        timeAxis.renderer.minGridDistance = this.timeGridUnit;
        timeAxis.baseInterval = { timeUnit: 'minute', count: this.state.timeUnit };

        let priceAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        priceAxis.renderer.minGridDistance = this.priceGridUnit;

        this.volumeAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        this.volumeAxis.height = this.volAxisHeight;
        this.volumeAxis.renderer.labels.template.disabled = true;
        this.volumeAxis.valign = 'bottom'; 
        
        
        // axis tooltips

        let timeTooltip = timeAxis.tooltip;
        timeTooltip.background.stroke = fg;
        timeTooltip.background.fill = am4core.color(bg);
        timeTooltip.background.pointerLength = 0;
        timeTooltip.background.cornerRadius = 4;
        timeTooltip.dy = 5;

        let priceTooltip = priceAxis.tooltip;
        priceTooltip.background.stroke = fg;
        priceTooltip.background.fill = am4core.color(bg);
        priceTooltip.background.pointerLength = 0;
        priceTooltip.background.cornerRadius = 4;

        this.volumeAxis.tooltip = null;

    }

    setupDataSerieses() {

        // data serieses

        let priceSeries = this.chart.series.push(new am4charts.CandlestickSeries());
        priceSeries.dataFields.dateX = 'time';
        priceSeries.dataFields.valueY = 'close';
        priceSeries.dataFields.openValueY = 'open';
        priceSeries.dataFields.lowValueY = 'low';
        priceSeries.dataFields.highValueY = 'high';
        priceSeries.clustered = false;

        let volumeSeries = this.chart.series.push(new am4charts.CandlestickSeries());
        volumeSeries.dataFields.dateX = 'time';
        volumeSeries.dataFields.openValueY = 'openVolume';
        volumeSeries.dataFields.valueY = 'valueVolume';
        volumeSeries.dataFields.highValueY = 'highVolume';
        console.log(this.volumeAxis);
        volumeSeries.yAxis = this.volumeAxis; // volumeAxis
        volumeSeries.clustered = false;
        volumeSeries.opacity = this.volSeriesOpacity;


        // series tooltips

        priceSeries.tooltipText = 
            'Open ${openValueY.value.formatNumber(\'#.00\')}\n' + 
            'Close ${valueY.value.formatNumber(\'#.00\')}\n' +
            'Low \u00A0\u00A0${lowValueY.value.formatNumber(\'#.00\')}\n' + 
            'High \u00A0${highValueY.value.formatNumber(\'#.00\')}';
        priceSeries.columns.template.tooltipY = am4core.percent(100);
        priceSeries.tooltip.pointerOrientation = 'right';
        priceSeries.tooltip.dx = this.tooltipDx;
        priceSeries.tooltip.background.strokeOpacity = 0;
        priceSeries.tooltip.fontSize = this.tooltipFontSize;

        volumeSeries.tooltipText = 'Vol. ${highValueY.value.formatNumber(\'#.#\')}K';
        volumeSeries.tooltip.pointerOrientation = 'right';
        volumeSeries.tooltip.dx = this.tooltipDx;
        volumeSeries.tooltip.background.fillOpacity = 0;
        volumeSeries.tooltip.background.strokeOpacity = 0;
        volumeSeries.tooltip.fontSize = this.tooltipFontSize;
    }

    // render
    render() {
        return (
            <div id='chart-main'>
                <div id='priceChart'></div>     
            </div>
        );
    }   
};

export default Chart;