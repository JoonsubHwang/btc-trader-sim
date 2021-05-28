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
const green = 'rgb(10, 180, 30)';
const red = 'rgb(200, 20, 0)';
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

class Chart extends Component {

    // constructor
    constructor(props) {

        super(props);

        // this.orderBookLength = 10; // number of prices
        // this.maxOrderSize = 400; // max number for each price

        // constants
        this.timeGridUnit = 50; // pixels
        this.priceGridUnit = 30; // pixels
        this.scrollbarMinWidth = 50; // pixels
        this.preZoomLevel = 0.5; // 50%

        // states
        this.state = {

            orderBook: [], // [ price, size, num-orders ]
            showSMA: true,
            ioc: false // immediate or cancel
        };
    }

    componentDidMount() {

        // chart

        let chart = am4core.create("priceChart", am4charts.XYChart);
        chart.responsive.enabled = true;
        chart.padding(30, 40, 10 ,30);
        // date format
        chart.dateFormatter.dateFormat = 'HH:mm';


        // axes

        chart.leftAxesContainer.layout = 'vertical' // separates axes vertically

        let timeAxis = chart.xAxes.push(new am4charts.DateAxis());
        timeAxis.renderer.grid.template.location = 0;
        timeAxis.renderer.minGridDistance = this.timeGridUnit;
        timeAxis.baseInterval = { timeUnit: "minute", count: 1 };

        let priceAxis = chart.yAxes.push(new am4charts.ValueAxis());
        priceAxis.renderer.minGridDistance = this.priceGridUnit;

        let volumeAxis = chart.yAxes.push(new am4charts.ValueAxis());


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

        let volumeSeries = chart.series.push(new am4charts.ColumnSeries());
        volumeSeries.dataFields.dateX = 'time';
        volumeSeries.dataFields.valueY = 'volume';
        volumeSeries.yAxis = volumeAxis;


        // initial data
        CbProAPI.loadHistory()
        .then(data => { 
            chart.data = data;
        })
        .catch(err => { 
            console.error(err); 
        });


        // tooltip
        priceSeries.tooltipText = 
            'Open: ${openValueY.value}[/]\n' + 
            'Close: ${valueY.value}[/]\n' +
            'Low: \u00A0\u00A0${lowValueY.value}[/]\n' + 
            'High: \u00A0${highValueY.value}[/]';
        priceSeries.columns.template.tooltipX = am4core.percent(0);
        priceSeries.columns.template.tooltipY = am4core.percent(100);

        
        // mouse cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = 'selectY';


        // scrollbar
        let scrollbarX = new am4core.Scrollbar();
        scrollbarX.parent = chart.bottomAxesContainer;
        scrollbarX.thumb.minWidth = this.scrollbarMinWidth;
        chart.scrollbarX = scrollbarX;
        chart.zoomOutButton.align = "left";


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
        chart.events.on('ready', () => {
            timeAxis.start = this.preZoomLevel;
            timeAxis.end = 1;
            timeAxis.keepSelection = true;
        })

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart)
            this.chart.dispose();
    }

    componentDidUpdate(oldProps) {

        let currentTime = new Date();

        // add new candle every minute
        if (currentTime.getSeconds() === 0) {
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
                    this.chart.data[1] = candle;
                    // redraw
                    this.chart.invalidateData();
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