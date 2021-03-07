import React, {useState, useEffect} from 'react';

function Chart(props) {

    const yAxisWidth = 40;
    const xAxisHeigth = 30;
    const barUnitWidth = 5;
    const priceUnitHeight = 35;
    const timeScale = 180;
    const [priceScale, setPriceScale] = useState(500);
    const [timeUnit, setTimeUnit] = useState(15);
    const [priceUnit, setPriceUnit] = useState(50);
    const [barUnit, setBarUnit] = useState(1);

    // return
    return (
        <div id='chart-main'>
            <table id='chart-table'>
                <tr>
                    <td>
                        <canvas id='price-chart' 
                                width={timeScale * barUnitWidth} height={(priceScale / priceUnit) * priceUnitHeight}>
                        </canvas>
                    </td>
                    <td>
                        <canvas id='y-axis' 
                                width={yAxisWidth} height={(priceScale / priceUnit) * priceUnitHeight}></canvas>
                    </td>
                </tr>
                <tr>
                    <td>
                        <canvas id='x-axis' 
                                width={timeScale * barUnitWidth} height={xAxisHeigth}></canvas>
                    </td>
                </tr>
            </table>
        </div>
    );
}

export default Chart;