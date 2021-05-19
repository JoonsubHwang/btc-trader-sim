import React, {Component} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import './Chart.css';
import './CbProAPI';
import { CbProAPI } from './CbProAPI';

// theme
function am4themes_dark(target) {

    const white = 'rgb(250, 250, 250)';
    const green = 'rgb(10, 180, 30)';
    const red = 'rgb(200, 20, 0)';

    if (target instanceof am4core.InterfaceColorSet) {
        target.setFor('grid', am4core.color(white));
        target.setFor('text', am4core.color(white));
        target.setFor('positive', am4core.color(green));
        target.setFor('negative', am4core.color(red));
    }
}

am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

class Chart extends Component {

    // constructor
    constructor(props) {

        super(props);

        // constants
        this.orderBookLength = 10; // number of prices
        this.maxOrderSize = 400; // max number for each price
        this.smaSize = 10; // simple moving average

        this.chartHeight = '500px';
        this.timeGridUnit = 100; // pixels
        this.priceGridUnit = 30; // pixels

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
        chart.padding(0, 30, 10 ,30);

        // date format
        chart.dateFormatter.inputDateFormat = 'MM/dd/yyyy, hh:mm:ss aa';
        chart.dateFormatter.dateFormat = 'HH:mm';

        // axes
        let timeAxis = chart.xAxes.push(new am4charts.DateAxis());
        timeAxis.renderer.grid.template.location = 0;
        timeAxis.renderer.minGridDistance = this.timeGridUnit;
        timeAxis.baseInterval = { timeUnit: "minute", count: 1 };

        let priceAxis = chart.yAxes.push(new am4charts.ValueAxis());
        priceAxis.renderer.minGridDistance = this.priceGridUnit;

        // data series
        let series = chart.series.push(new am4charts.CandlestickSeries());
        series.dataFields.dateX = "time";
        series.dataFields.valueY = "close";
        series.dataFields.openValueY = "open";
        series.dataFields.lowValueY = "low";
        series.dataFields.highValueY = "high";

        // initial data
        CbProAPI.loadHistory()
        .then(data => { 
            chart.data = data;
        })
        .catch(err => { 
            console.error(err); 
        });

        // tooltip
        series.tooltipText = 
            'Open: ${openValueY.value}[/]\n' + 
            'Close: ${valueY.value}[/]\n' +
            'Low: ${lowValueY.value}[/]\n' + 
            'High: ${highValueY.value}[/]';
        series.columns.template.tooltipX = am4core.percent(50);
        series.columns.template.tooltipY = am4core.percent(50);

        // mouse cursor & wheel
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = 'none';
        chart.mouseWheelBehavior = 'panX'
        // chart.scrollbarX = new am4core.Scrollbar();
        // chart.scrollbarX.parent = chart.bottomAxesContainer;
        // chart.scrollbarX.thumb.minWidth = 50;

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart)
            this.chart.dispose();
    }

    // render
    render() {
        return (
            <div id='chart-main'>
                <div id='priceChart' style={{ width: '100%', height: this.chartHeight }}></div>     
            </div>
        );
    }   
};

export default Chart;