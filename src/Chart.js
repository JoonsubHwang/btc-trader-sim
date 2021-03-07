import React, {useState, useEffect, Component} from 'react';
import './Chart.css';

class Chart extends Component {

    // constructor
    constructor(props) {

        super(props);

        this.state = {
            yAxisWidth: 40,
            xAxisHeigth: 30,
            barUnitWidth: 5,
            priceUnitHeight: 35,
            timeScale: 180,

            priceScale: 500,
            timeUnit: 15,
            priceUnit: 50,
            barUnit: 1
        };
    }



    // functions

    drawBg() {
        const chart = document.querySelector('#price-chart');
        if (chart.getContext('2d')) {
            // chart.fillStyle = 'rgb(0, 0, 30)';
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
                                    width={this.state.timeScale * this.state.barUnitWidth} height={(this.state.priceScale / this.state.priceUnit) * this.state.priceUnitHeight}>
                            </canvas>
                        </td>
                        <td>
                            <canvas id='y-axis' 
                                    width={this.state.yAxisWidth} height={(this.state.priceScale / this.state.priceUnit) * this.state.priceUnitHeight}></canvas>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <canvas id='x-axis' 
                                    width={this.state.timeScale * this.state.barUnitWidth} height={this.state.xAxisHeigth}></canvas>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
};

export default Chart;