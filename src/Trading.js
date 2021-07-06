import React from 'react';
import { Menu } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import Chart from './Chart';
import SignIn from './SignIn';
import { CbProAPI } from './CbProAPI';
import orderTypes from './orderTypes.js';
import './Trading.css';

class Trading extends React.Component {

    // constructor
    constructor(props) {

        super(props);

        // constants
        this.iUpdate = 500; // interval for updating (ms)
        this.priceStep = 100; // dolalrs

        this.state = {
            price: undefined,
            priceColor: 'white',
            cash: 0,
            BTCWallet: 0,
            buy: true, // false = sell
            orderPrice: 0,
            orderType: orderTypes.LIMIT_ORDER,
            IOC: false, // immedate or cancel
            orderAmount: 0 //  BTC
        }
    }

    componentDidMount = () => {
        // set update timer
        this.tUpdate = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount = () => {
        clearInterval(this.tUpdate);
    }



    // update
    update = () => {
        this.updatePrice();
    }


    // event handlers

    setOrderType = (event) => {
        event.preventDefault();

        this.setState({ orderType: event.target.innerHTML });
    }

    setBuyOrSell = (event) => {
        event.preventDefault();
        this.setState({ buy: (event.target.id === 'buy-btn') });
    }

    setOrderPrice = (event) => {
        this.setState({ orderPrice: event.target.value });
    }

    setOrderAmount = (event) => {
        this.setState({ orderAmount: event.target.value });
    }

    submitOrder = (event) => {

        event.preventDefault();

        if (this.state.orderType === orderTypes.MARKET_ORDER)
            this.setState(this.state.orderPrice, this.state.price);

        let req = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                buy: this.state.buy,
                orderType: this.state.orderType,
                price: this.state.orderPrice,
                amount: this.state.orderAmount
            })
        }

        fetch('submit-order', req)
        .then(res => {
            // TODO: handle redirect?
            // TODO: handle reject (invalid order)
        })
        .catch(err => {
            console.error(err);
        })
    }

    toggleDropdown = () => {
        document.querySelector('#menu-list').classList.toggle('visible');
    }

    toggleSignInPopup = () => {
        document.querySelector('#signin-main').classList.toggle('visible');
    }



    // helpers
    updatePrice = () => {
        CbProAPI.loadNewPrice()
        .then(newPrice => {

            // change color of price when it's changed
            if (newPrice > this.state.price)
                this.setState({ priceColor: 'green' });
            else if (newPrice < this.state.price)
                this.setState({ priceColor: 'red' });
            else 
                this.setState({ priceColor: 'white' });

            // store new price
            this.setState({ 
                price: newPrice,
            });
        })
        .catch(err => {
            // TODO: use popup
            console.error(err);
        });
    }



    // render
    
    render() {

        return (
            <div id='trading-main' className='container'>

                <div id='trading-grid'>

                    {/* price-panel */}
                    <div id='price-panel'>
                        <h1 id='price-heading'>BTC-USD <span className={this.state.priceColor}>${Number(this.state.price).toFixed(2)}</span></h1>
                    </div>

                    {/* menu-panel */}
                    <div id='menu-panel'>

                        <div id='menu-grid'>
                            
                            {this.props.email ?
                                <button id='orders-btn'>Orders</button>
                                : <div/>}
                            
                            <div id='dropdown-menu'>
                                <Menu id='menu-btn' onClick={this.toggleDropdown}></Menu>
                                {this.props.email ?
                                    <div id='menu-list'>
                                        <p>{this.props.email}</p> {/* TODO: display name instead */}
                                        <button>Sign Out</button>
                                    </div>
                                    : 
                                    <div id='menu-list'>
                                        <button onClick={this.toggleSignInPopup}>Sign In</button>
                                        <button>Sign Up</button>
                                    </div>}
                            </div>
                        </div>

                    </div>
                    
                    <SignIn setEmail={this.props.setEmail} toggleSignInPopup={this.toggleSignInPopup}></SignIn>
        
                    {/* chart-panel */}
                    <div id='chart-panel' className='container framed'>
                        <Chart price={this.state.price}></Chart>
                    </div>

                    {/* txn-panel (transaction) */}
                    <div id='txn-panel' className='container framed'>

                        <button id='buy-btn'  className={'medium ' + (this.state.buy ? 'selected' : '')} onClick={this.setBuyOrSell}>BUY</button>
                        <button id='sell-btn' className={'medium ' + (this.state.buy ? '' : 'selected')} onClick={this.setBuyOrSell}>SELL</button>

                        <form id='order-form'>

                            <label>Amount</label>

                            {/* 3 order type buttons */}
                            {Object.values(orderTypes).map(orderType => 
                                <button className={'orderType-btn' + (this.state.orderType === orderType  ? ' selected' : '')} 
                                    onClick={this.setOrderType} key={orderType}>
                                    {orderType}
                                </button>
                            )}

                            <label htmlFor='orderPrice'>Price</label>

                            {/* order price */}
                            {this.state.orderType === orderTypes.MARKET_ORDER ?
                                <p id='marketPrice' className='value'>Market Price</p>
                                : <input className='value' type='number' name='orderPrice' step={this.priceStep} value={this.state.orderPrice} min='0' 
                                    onChange={this.setOrderPrice}></input>}

                            <p className='name'> USD</p>

                            <label htmlFor='orderAmount'>Amount</label>

                            {/* order amount */}
                            <input className='value' type='number' name='orderAmount' 
                                step={((this.state.buy ? (this.state.cash / this.state.orderPrice) : this.state.BTCWallet) * 0.1).toFixed(4)} 
                                value={this.state.orderAmount} min='0' 
                                max={this.state.buy ? this.state.cash / this.state.orderPrice : this.state.BTCWallet} 
                                onChange={this.setOrderAmount}></input>

                            <p className='name'> BTC</p>

                            {/* order amount in USD */}
                            <p id='amountUSD' className='value'>≈ {((this.state.orderType === orderTypes.MARKET_ORDER ? this.state.price : this.state.orderPrice) 
                                                                    * this.state.orderAmount).toFixed(2)}</p>

                            <p id='amountUSDUnit' className='name'> USD</p>

                            {/* order button */}
                            <button id='order-btn' onClick={this.submitOrder} className={this.state.buy ? 'green' : 'red'}>Make Order</button>

                        </form>

                    </div>

                    {/* balance-panel */}
                    <div id='balance-panel' className='container framed'>

                        <h2 id='balance-heading' className='large'>Balance</h2>
                        
                        <div id='balance-grid'>
                            <p className='name'>Total</p>
                            <p className='value'>{(this.state.cash + (this.state.BTCWallet * this.state.price)).toFixed(0)} USD</p>
                            <p className='name'>Cash</p>
                            <p className='value'>{this.state.cash.toFixed(0)} USD</p>
                            <p className='name'>BTC</p>
                            <p className='value'>{this.state.BTCWallet} BTC</p>
                        </div>

                    </div>

                </div>
                
            </div>
        );
    }
}

export default Trading;
