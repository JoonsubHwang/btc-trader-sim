import React, {Component} from 'react';
import './Chart.css';

class Chart extends Component {

    // constructor
    constructor(props) {

        super(props);

        this.yAxisWidth = 40;
        this.xAxisHeigth = 30;
        this.candleWidth = 5;
        this.priceUnitHeight = 35; // pixels per priceUnit
        this.timeRange = 180; // timeUnits

        this.orderBookLength = 10; // number of prices
        this.maxOrderSize = 400; // max number for each price
        this.smaSize = 10; // simple moving average

        this.gridColor = 'rgb(0, 0, 30)';

        this.state = {
            priceScale: 700,
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



    // functions

    drawBg() {
        const chart = document.querySelector('#price-chart');
        if (chart.getContext('2d')) {
            chart.fillStyle = this.gridColor;
        }
    }



    // render
    render() {

        return (
            <div id='chart-main'>
                <table id='chart-table'>
                    <tr>
                        <td>
                            <canvas id='price-chart' 
                                    width={this.timeRange * this.barUnitWidth} height={(this.state.priceScale / this.state.priceUnit) * this.priceUnitHeight}>
                            </canvas>
                        </td>
                        <td>
                            <canvas id='y-axis' 
                                    width={this.yAxisWidth} height={(this.state.priceScale / this.state.priceUnit) * this.priceUnitHeight}></canvas>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <canvas id='x-axis' 
                                    width={this.timeRange * this.barUnitWidth} height={this.xAxisHeigth}></canvas>
                        </td>
                        <td>
                            <canvas id='leftover'
                                    width={this.yAxisWidth} height={this.xAxisHeigth}></canvas>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
};

export default Chart;