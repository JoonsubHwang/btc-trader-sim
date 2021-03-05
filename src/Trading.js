import React, {useState, useEffect} from 'react';

function Trading(props) {

    const iUpdate = 100; // interval for updating 
    const [price, setPrice] = useState(0);
    const [balance, setBalance] = useState(props.balance);
    const [BTCOwned, setBTCOwned] = useState(5);
    const [value, setValue] = useState(0);


    // effect
    useEffect(() => {

        const tUpdate = setInterval(() => {
            setPrice(price + 1.0);
            setValue(BTCOwned * price);
        }, iUpdate);

        return ()=> { 
            clearInterval(tUpdate);
        }
    });


    // return
    return (
        <div className='trading'>
            <h1>BTC ${price}</h1>

            <p> Balance: {balance}</p>

            <p> BTC owned: {BTCOwned} (${value})</p>
        </div>
    );
}

export default Trading;
