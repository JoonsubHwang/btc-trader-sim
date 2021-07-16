import React from 'react';
import orderTypes from './orderTypes';
import lvrgRatios from './lvrgRatios';
import './Transaction.css';

export default class Transaction extends React.Component {
    
    constructor(props) {

        super(props);

        this.state = {
            orderPrice: 0,
            orderType: orderTypes.LIMIT_ORDER,
            orderAmount: 0, // BTC
            leverage: lvrgRatios[0] // multiplier (1.0)
        }
    }

    render = () =>
        <div id='transaction-main' className='framed'>

            <form id='order-form'>

                <label>Type</label>

                <div id='orderTypes-grid'>
                    {/* 3 order type buttons */}
                    {Object.values(orderTypes).map((orderType, i) => 
                        <button id={'orderType-'+i} className={'orderType-btn' + (this.state.orderType === orderType  ? ' selected' : '')} 
                            onClick={this.setOrderType} key={orderType}>
                            {orderType}
                        </button>
                    )}
                </div>

                <label htmlFor='orderPrice'>Price</label>

                {/* order price */}
                <div className='input-grid'>

                    {this.state.orderType === orderTypes.MARKET_ORDER ?
                        <p id='marketPrice' className='value'>Market Price</p>
                        : <input className='value' type='number' name='orderPrice' step={this.priceStep} value={this.state.orderPrice} 
                            onChange={this.setOrderPrice} step={0.01} />}

                    <p className='name'> USD</p>

                </div>

                <label htmlFor='orderAmount'>Amount</label>

                {/* order amount */}
                <div className='input-grid'>
                    <input className='value' type='number' name='orderAmount' 
                        value={this.state.orderAmount} min='0' 
                        onChange={this.setOrderAmount} step={0.0001} />

                    <p id='amountUnit' className='name'> BTC</p>
                </div>

                <div id='orderAmountUSD-grid'>

                    {/* order amount in USD */}
                    <p id='amountUSD' className='value'>{((this.state.orderType === orderTypes.MARKET_ORDER ? this.props.price : this.state.orderPrice) 
                                                            * this.state.orderAmount).toFixed(2)}</p>

                    <p id='amountUSDUnit' className='name'> USD</p>
                </div>

                {/* leverage */}
                <label>Leverage</label>

                <div id='lvrgRatios-grid'>
                    {/* 4 leverage levels */}
                    {lvrgRatios.map((lvrgRatio, i) => 
                        <button id={'lvrgRatio-'+i} className={(this.state.leverage == lvrgRatio)  ? 'lvrgRatio-btn selected' : 'lvrgRatio-btn'} 
                            onClick={this.setLeverage} key={lvrgRatio}>
                            {lvrgRatio.toFixed(1)} ×
                        </button>
                    )}
                </div>

                {/* order button */}
                <div id='orderBtns-grid'>
                    <button id='buy-btn'>Buy BTC</button>
                    <button id='sell-btn'>Sell BTC</button>
                </div>

            </form>

        </div>

    // event handlers

    setOrderType = (event) => {
        event.preventDefault();
        this.setState({ orderType: event.target.innerText });
    };

    setOrderPrice = (event) => {
        this.setState({ orderPrice: event.target.value });
    };

    setOrderAmount = (event) => {
        this.setState({ orderAmount: event.target.value });
    };

    setLeverage = (event) => {
        event.preventDefault();
        console.log(event.target.innerText.substr(0,3))
        console.log(this.state.leverage)
        this.setState({ leverage: event.target.innerText.substr(0,3) });
    };

    submitOrder = (event) => {

        event.preventDefault();

        if (this.state.orderType === orderTypes.MARKET_ORDER)
            this.setState(this.state.orderPrice, this.props.price);

        let req = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                orderType: this.state.orderType,
                price: this.state.orderPrice,
                amount: this.state.orderAmount
            })
        }

        fetch('submit-order', req).then(res => {
            // TODO: handle redirect?
            // TODO: handle reject (invalid order)
        })
        .catch(err => {
            console.error(err);
        })
    };
}