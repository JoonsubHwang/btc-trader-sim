import React from 'react';
import './Transaction.css';
const orderTypes = require('./client-modules/orderTypes');

export default class Transaction extends React.Component {
    
    constructor(props) {

        super(props);

        this.state = {
            orderPrice: 0,
            orderType: orderTypes.LIMIT_ORDER,
            orderAmount: 0.001 // BTC
        }
    }

    render = () =>
        <div id='transaction-main' className='framed'>

            <form id='order-form'>

                <label>Type</label>

                {/* 3 order type buttons */}
                <div id='orderTypes-grid'>
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
                        : <input className='value' type='number' name='orderPrice' value={this.state.orderPrice} 
                            onChange={this.setOrderPrice} step={0.01} />}

                    <p className='name'> USD</p>

                </div>

                <label htmlFor='orderAmount'>Amount</label>

                {/* order amount */}
                <div className='input-grid'>
                    <input className='value' type='number' name='orderAmount' 
                        value={this.state.orderAmount} min='0.001' 
                        onChange={this.setOrderAmount} />

                    <p id='amountUnit' className='name'> BTC</p>
                </div>

                <div id='orderAmountUSD-grid'>

                    {/* order amount in USD */}
                    <p id='amountUSD' className='value'>{((this.state.orderType === orderTypes.MARKET_ORDER ? this.props.price : this.state.orderPrice) 
                                                            * this.state.orderAmount).toFixed(2)}</p>

                    <p id='amountUSDUnit' className='name'> USD</p>
                </div>

                {/* order button */}
                <div id='orderBtns-grid'>
                    <button id='buy-btn' onClick={this.submitOrder}>Buy BTC</button>
                    <button id='sell-btn' onClick={this.submitOrder}>Sell BTC</button>
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

    submitOrder = (event) => {

        event.preventDefault();

        const buy = (event.target.id === 'buy-btn') ?
                    true
                    : false;

        let req = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                buy: buy,
                orderType: this.state.orderType,
                orderPrice: this.state.orderPrice,
                orderAmount: this.state.orderAmount
            })
        }

        fetch('order', req)
        .then(res => res.json())
        .then(res => {
            if (res.error)
                throw new Error(res.error);
            else if (res.invalid)
                this.props.displayPopupMsg(false, 'Invalid order: ' + res.invalid);
            else
                this.props.displayPopupMsg(true, 'Order is processed successfully.');
        })
        .catch(err => {
            this.props.displayPopupMsg(false, err.message);
        })
    };
}