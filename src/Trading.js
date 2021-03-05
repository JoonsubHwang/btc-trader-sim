import React, {useState, useEffect} from 'react';

function Trading(props) {

    const iUpdatePrice = 100; // interval for updating price
    const [price, setPrice] = useState(0);
    const [balance, setBalance] = useState(props.balance);
    const [ownedBTC, setOwnedBTC] = useState(0);


    // effect
    useEffect(() => {
        const tUpdatePrice = setInterval(() => {
            setPrice(price + 1.0);
        }, iUpdatePrice);

        return ()=> { 
            clearInterval(tUpdatePrice);
        }
    });


    // return
    return (
        <div className='trading'>
            <h1>BTC ${price}</h1>
            <p> Balance: {balance}</p>
        </div>
    );
}

export default Trading;
