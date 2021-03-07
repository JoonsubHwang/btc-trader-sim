import React, {useState, useEffect} from 'react';

function Chart(props) {

    const barUnitWidth = 10;
    const priceUnitHeight = 50;
    const [timeUnit, setTimeUnit] = useState(15);
    const [priceUnit, setPriceUnit] = useState(50);
    const [barUnit, setBarUnit] = useState(1);

    // return
    return (
        <div className="chart">

        </div>
    );
}

export default Chart;