import React, {Component} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import './Chart.css';
import './CbProAPI';

function am4themes_dark(target) {

    let white = 'rgb(250, 250, 250)';
    let green = 'rgb(10, 180, 30)';
    let red = 'rgb(200, 20, 0)';

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

        this.yAxisWidth = 40;
        this.xAxisHeigth = 30;
        this.candleWidth = 5; // pixels per timeUnit
        this.priceUnitHeight = 35; // pixels per priceUnit
        this.timeRange = 180; // timeUnits

        this.orderBookLength = 10; // number of prices
        this.maxOrderSize = 400; // max number for each price
        this.smaSize = 10; // simple moving average

        this.gridColor = 'rgb(0, 0, 30)';

        this.state = {
            priceRange: 700,
            timeUnit: 1, // minutes
            priceUnit: 50, // dollars
            barUnit: 1, // 

            candles: [], // [ time, low, high, open, close, volume ]
            lowestCdl: 0, // price
            highestCdl: 0, // price
            orderBook: [], // [ price, size, num-orders ]
            showSMA: true,

            ioc: false // immediate or cancel
        };
    }

    componentDidMount() {

        let chart = am4core.create("priceChart", am4charts.XYChart);
        chart.padding(0, 30, 10 ,30);

        chart.dateFormatter.inputDateFormat = 'yyyy.MM.dd HH:mm:ss';
        chart.dateFormatter.dateFormat = 'HH:mm';

        let timeAxis = chart.xAxes.push(new am4charts.DateAxis());
        timeAxis.renderer.grid.template.location = 0;
        timeAxis.renderer.minGridDistance = 50;

        let priceAxis = chart.yAxes.push(new am4charts.ValueAxis());

        let series = chart.series.push(new am4charts.CandlestickSeries());
        series.dataFields.dateX = "time";
        series.dataFields.valueY = "close";
        series.dataFields.openValueY = "open";
        series.dataFields.lowValueY = "low";
        series.dataFields.highValueY = "high";

        series.tooltipText = 
            'Open: ${openValueY.value}[/]\n' + 
            'Close: ${valueY.value}[/]\n' +
            'Low: ${lowValueY.value}[/]\n' + 
            'High: ${highValueY.value}[/]';
        series.columns.template.tooltipX = am4core.percent(50);
        series.columns.template.tooltipY = am4core.percent(50);

        chart.cursor = new am4charts.XYCursor();
        chart.scrollbarX = new am4core.Scrollbar();

        chart.data = [
            {
                'time': '2016.09.21 19:18:00',
                'open': '236.65',
                'high': '236.96',
                'low': '134.15',
                'close': '136.49'
            }, {
                "time": "2016.09.21 19:19:00",
                "open": "136.49",
                "high": "139.95",
                "low": "131.50",
                "close": "131.85"
            }, {
                "time": "2016.09.21 19:20:00",
                "open": "131.85",
                "high": "145.95",
                "low": "130.50",
                "close": "141.85"
            }
        ]

        // let point = timeAxis.dateToPoint(lastTime);
        // chart.cursor.triggerMove(point, soft, true);

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
                <div id='priceChart' style={{ width: '100%', height: '400px' }}></div>       
            </div>
        );
    }   
};

export default Chart;