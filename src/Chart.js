import React, {Component} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import './Chart.css';

am4core.useTheme(am4themes_animated);

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
            `Open: [bold]${series.dataFields.openValueY.value}[/]\n'
            Low: [bold]${series.dataFields.lowValueY.value}[/]\n
            High: [bold]${series.dataFields.highValueY.value}[/]\n
            Close: [bold]${series.dataFields.valueY.value}[/]`;

        series.dropFromOpenState.properties.fill = am4core.color('#992211');
        series.riseFromOpenState.properties.stroke = am4core.color('#992211');
        series.riseFromOpenState.properties.fill = am4core.color('#119922');
        series.riseFromOpenState.properties.stroke = am4core.color('#119922');

        chart.cursor = new am4charts.XYCursor();
        chart.scrollbarX = new am4core.Scrollbar();

        chart.data = [
            {
                'time': '2016.09.21 19:18:00',
                'open': '136.65',
                'high': '136.96',
                'low': '134.15',
                'close': '136.49'
            }, {
                "time": "2016.09.21 19:19:00",
                "open": "136.49",
                "high": "135.95",
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
                <div id='priceChart' style={{ width: '80%', height: '500px' }}></div>       
            </div>
        );
    }   
};

export default Chart;