import React, {useState, useEffect} from 'react';

function Chart(props) {

    const barUnitWidth = 10;
    const priceUnitHeight = 50;
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
                        <canvas id='y-axis'></canvas>
                    </td>
                </tr>
                <tr>
                    <td>
                        <canvas id='x-axis'></canvas>
                    </td>
                </tr>
            </table>
        </div>
    );
}

export default Chart;