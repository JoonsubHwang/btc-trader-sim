import React, {useState, useEffect} from 'react';

function Trading(props) {

    const iUpdatePrice = 100; // interval for updating price
    const [price, setPrice] = useState(0);
    const [balance, setBalance] = useState(props.balance);


    // effect
    useEffect(() => {
        const tUpdatePrice = setInterval(() => {
            setPrice(++price);
        }, iUpdatePrice);
    });


    // return
    return (
        <div className='trading'>
            <h1>BTC {price}</h1>
        </div>
    );
}

export default Trading;
