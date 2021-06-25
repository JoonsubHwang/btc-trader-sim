import React, {Component} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import './Chart.css';
import { CbProAPI } from './CbProAPI';

// colors
const fg = 'rgb(230, 230, 230)';
const fgDarker = 'rgb(150, 150, 150)';
const bg = 'rgb(24, 24, 41)';
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

        // this.orderBookLength = 10; // number of prices
        // this.maxOrderSize = 400; // max number for each price

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
            showSMA: true,
            // ioc: false // immediate or cancel
        };
    }

    componentDidMount() {

        // chart

        let chart = am4core.create("priceChart", am4charts.XYChart);
        chart.responsive.enabled = true;
        chart.padding(15, 15, 0, 0); // padding (pixels)
        chart.dateFormatter.dateFormat = 'HH:mm'; // date format


        // axes

        chart.leftAxesContainer.layout = 'vertical' // separates axes vertically

        let timeAxis = chart.xAxes.push(new am4charts.DateAxis());
        timeAxis.renderer.grid.template.location = 0;
        timeAxis.renderer.minGridDistance = this.timeGridUnit;
        timeAxis.baseInterval = { timeUnit: 'minute', count: this.state.timeUnit };

        let priceAxis = chart.yAxes.push(new am4charts.ValueAxis());
        priceAxis.renderer.minGridDistance = this.priceGridUnit;

        let volumeAxis = chart.yAxes.push(new am4charts.ValueAxis());
        volumeAxis.height = this.volAxisHeight;
        volumeAxis.renderer.labels.template.disabled = true;
        volumeAxis.valign = 'bottom';

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

        volumeAxis.tooltip = null;

        
        // data serieses

        let priceSeries = chart.series.push(new am4charts.CandlestickSeries());
        priceSeries.dataFields.dateX = 'time';
        priceSeries.dataFields.valueY = 'close';
        priceSeries.dataFields.openValueY = 'open';
        priceSeries.dataFields.lowValueY = 'low';
        priceSeries.dataFields.highValueY = 'high';
        priceSeries.clustered = false;

        // data-grouping func
        priceSeries.adapter.add('groupDataItem', function(grpCandle) {
            
            const candles = grpCandle.dataItem.groupDataItems;
            grpCandle.valueY = candles[candles.length-1].valueY; // last close
            
            let low = candles[0].lowValueY;
            let high = candles[0].highValueY;

            for (const candle in candles) {
                if (candle.lowValueY < low) 
                    low = candle.lowValueY; // lowest low
                if (candle.highValueY > high) 
                    high = candle.highValueY; // highest high
            }
            grpCandle.lowValueY = low;
            grpCandle.highValueY = high;

            console.log(grpCandle)

            return grpCandle;
        })

        let volumeSeries = chart.series.push(new am4charts.CandlestickSeries());
        volumeSeries.dataFields.dateX = 'time';
        volumeSeries.dataFields.openValueY = 'openVolume';
        volumeSeries.dataFields.valueY = 'valueVolume';
        volumeSeries.dataFields.highValueY = 'highVolume';
        volumeSeries.yAxis = volumeAxis;
        volumeSeries.clustered = false;
        volumeSeries.opacity = this.volSeriesOpacity;



        // initial data
        CbProAPI.loadHistory()
        .then(data => { 
            chart.data = data;
        })
        .catch(err => { 
            console.error(err); 
        });


        // series tooltip

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

        
        // mouse cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = 'selectY';


        // theme
        chart.background.show();
        chart.cursor.lineX.strokeOpacity = 1;
        chart.cursor.lineX.strokeDasharray = [];
        chart.cursor.lineX.strokeWidth = 1;
        chart.cursor.lineY.strokeOpacity = 1;
        chart.cursor.lineY.strokeDasharray = [];
        chart.cursor.lineY.strokeWidth = 1;

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart)
            this.chart.dispose();
    }

    componentDidUpdate(oldProps) {

        let currentTime = new Date();

        // add new candle every minute
        if ((currentTime.getSeconds() === 0) && (currentTime.getMinutes() !== this.chart.data[0].time.getMinutes())) {

            // add new candle
            this.chart.data.unshift({
                time: currentTime,
                low: this.props.price,
                high: this.props.price,
                open: this.props.price,
                close: this.props.price,
                volume: 0
            });

            // remove the oldest candle
            this.chart.data.pop();
            
            // redraw
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

                // redraw
                this.chart.invalidateRawData();
            }

            // update last minute's candle at 30 seconds (to get the volume)
            if (currentTime.getSeconds() === 30) {

                CbProAPI.loadCandle()
                .then(candle => {
                    if ((this.chart.data[1].openVolume !== candle.openVolume) || (this.chart.data[1].valueVolume !== candle.valueVolume)) {
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