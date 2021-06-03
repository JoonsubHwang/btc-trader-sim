import React, {Component} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import './Chart.css';
import './CbProAPI';
import { CbProAPI } from './CbProAPI';

// colors
const white = 'rgb(250, 250, 250)';
const black = 'rgb(0, 0, 0)';
const navy = 'rgb(20, 20, 30)';
const green = 'rgb(20, 180, 140)';
const red = 'rgb(250, 70, 90)';
const cyan = 'rgb(100, 220, 220)';

// theme
function am4themes_dark(target) {

    if (target instanceof am4core.InterfaceColorSet) {
        
        target.setFor('background',             am4core.color(black));
        target.setFor('alternativeBackground',  am4core.color(cyan));

        target.setFor('primaryButton',        am4core.color(navy));
        target.setFor('primaryButtonHover',   am4core.color(navy));
        target.setFor('primaryButtonActive',  am4core.color(navy));
        target.setFor('primaryButtonStroke',  am4core.color(cyan));

        target.setFor('secondaryButton',        am4core.color(navy));
        target.setFor('secondaryButtonHover',   am4core.color(navy));
        target.setFor('secondaryButtonActive',  am4core.color(navy));
        target.setFor('secondaryButtonStroke',  am4core.color(cyan));

        target.setFor('grid',       am4core.color(white));
        target.setFor('text',       am4core.color(white));

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
        this.volAxisHeight = 60; // pixels
        this.scrollbarMinWidth = 100; // pixels
        this.scrlbarMarginBottom = 20;
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
        chart.padding(10, 40, 0, 20); // padding (pixels)
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


        // axis tooltips

        let timeTooltip = timeAxis.tooltip;
        timeTooltip.background.fill = am4core.color(navy);
        timeTooltip.background.pointerLength = 0;
        timeTooltip.background.cornerRadius = 4;
        timeTooltip.dy = 5;

        let priceTooltip = priceAxis.tooltip;
        priceTooltip.background.fill = am4core.color(navy);
        priceTooltip.background.pointerLength = 0;
        priceTooltip.background.cornerRadius = 4;

        
        // data serieses

        let priceSeries = chart.series.push(new am4charts.CandlestickSeries());
        priceSeries.dataFields.dateX = 'time';
        priceSeries.dataFields.valueY = 'close';
        priceSeries.dataFields.openValueY = 'open';
        priceSeries.dataFields.lowValueY = 'low';
        priceSeries.dataFields.highValueY = 'high';
        priceSeries.clustered = false;

        // data grouping func
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
            'Open: ${openValueY.value.formatNumber(\'#.00\')}\n' + 
            'Close: ${valueY.value.formatNumber(\'#.00\')}\n' +
            'Low: \u00A0\u00A0${lowValueY.value.formatNumber(\'#.00\')}\n' + 
            'High: \u00A0${highValueY.value.formatNumber(\'#.00\')}';
        priceSeries.columns.template.tooltipX = am4core.percent(0);
        priceSeries.columns.template.tooltipY = am4core.percent(100);
        priceSeries.tooltip.pointerOrientation = 'right';

        volumeSeries.tooltipText = 'Volume: ${highValueY.value.formatNumber(\'#.#\')}K';
        volumeSeries.tooltip.pointerOrientation = 'right';

        
        // mouse cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = 'selectY';


        // scrollbar
        // let scrollbarX = new am4core.Scrollbar();
        // scrollbarX.parent = chart.bottomAxesContainer;
        // scrollbarX.thumb.minWidth = this.scrollbarMinWidth;
        // scrollbarX.thumb.draggable = false;
        // scrollbarX.marginBottom = this.scrlbarMarginBottom;
        // chart.scrollbarX = scrollbarX;
        // chart.zoomOutButton.align = "left";


        // theme
        chart.background.show();
        chart.zoomOutButton.icon.stroke = cyan;
        chart.cursor.lineX.strokeOpacity = 1;
        chart.cursor.lineX.strokeDasharray = [];
        chart.cursor.lineX.strokeWidth = 1;
        chart.cursor.lineY.strokeOpacity = 1;
        chart.cursor.lineY.strokeDasharray = [];
        chart.cursor.lineY.strokeWidth = 1;

        
        // pre-zoom
        // chart.events.on('ready', () => {
        //     timeAxis.start = this.preZoomLevel;
        //     timeAxis.end = 1;
        //     timeAxis.keepSelection = true;
        // })

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
                    if (this.chart.data[1].volume !== candle.volume) { // only once
                        // update volume
                        this.chart.data[1].volume = candle.volume;
                        // redraw
                        this.chart.invalidateRawData();
                    }
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