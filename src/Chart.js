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

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart)
            this.chart.dispose();
    }



    // functions

    drawBg() {
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