import React from 'react';
import { Menu } from '@material-ui/icons';

import Chart from './Chart';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { CbProAPI } from './CbProAPI';
import orderTypes from './orderTypes';
import levRatios from './lvrgRatios';
import './Trading.css';

class Trading extends React.Component {

    // constructor
    constructor(props) {

        super(props);

        // constants
        this.iUpdate = 500; // interval for updating (ms)
        this.priceStep = 100; // dolalrs

        this.state = {
            // account
            email: null, // present if signed in
            name: null,
            balance: {
                cash: 0,
                BTC: 0
            },
            orderlist: {},

            // price
            price: 0,
            priceColor: 'white',

            // order
            orderPrice: 0,
            orderType: orderTypes.LIMIT_ORDER,
            orderAmount: 0, // BTC
            leverage: levRatios[0] // multiplier (1.0)
        }
    }

    componentDidMount = () => {
        // load data
        this.update();
        // set update timer
        this.tUpdate = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount = () => {
        clearInterval(this.tUpdate);
    }



    // update (main loop)
    update = () => {
        this.updatePrice();
        this.checkSignedIn()
        .then(() => {
            if (this.state.email)
                this.updateAccountData();
        });
    }



    // helpers

    updatePrice = () => {
        CbProAPI.loadNewPrice().then(newPrice => {

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
            console.error('Error updating price. (' + err + ')');
        });
    }

    setEmailAndName = (email, name = null) => {

        this.setState({ email: email, name: name });

        if (email === null) {
            this.setState({
                balance: {
                    cash: 0,
                    BTC: 0
                },
                orderlist: {}
            });
        }
    }

    // load email if signed in
    checkSignedIn = async () => {

        fetch('/sign-in-data', { method: 'GET' }).then(res => {

            // if signed in
            if (res.status !== 204)
                res.json().then(res => {
                    // store email
                    this.setEmailAndName(res.email, res.name); 
                    return;
                });

            // if not signed in
            else {
                this.setEmailAndName(null);
                return;
            }

        }).catch(err => {
            console.error('Error checking sign in. (' + err + ')');
        });
    };

    // update balance and orderlist
    updateAccountData = () => {

        const req = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ cash: this.state.balance.cash })
        };

        fetch('/account-updates', req)
        .then(res => res.status === 204 ? res : res.json())
        .then(res => {
            // if updates are received
            if (res.balance) {
                // update data 
                this.setState( { balance: res.balance });
                this.setState( { orderlist: res.orderlist });
            }
            // on server error
            else if (res.error)
                throw new Error(res.error);

            // else: no update

        }).catch(err => {
            console.error('Error updating account data. (' + err.message + ')');
        });
    };



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
            this.setState(this.state.orderPrice, this.state.price);

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

    toggleDropdown = () => {
        document.querySelector('#menu-list').classList.toggle('visible');
    };

    toggleSignInPopup = () => {
        document.querySelector('#signin-main').classList.toggle('visible');
    };

    toggleSignUpPopup = () => {
        document.querySelector('#signup-main').classList.toggle('visible');
    };

    signOut = () => {

        fetch('/sign-out', { method: 'POST' })
        .then(res => res.status === 500 ? res.json() : res)
        .then(res => {
            
            // on server error
            if (res.error)
                throw new Error(res.error);

            // on success
            else
                this.setEmailAndName(null);
        })
        .catch(err => {
            alert(err); // TODO: use popup
        });
    };



    // render
    
    render() {

        return (
            <div id='trading-main'>

                <div id='trading-grid'>

                    {/* price-panel */}
                    <div id='price-panel'>
                        <h1 id='price-heading'>BTC-USD <span className={this.state.priceColor}>${Number(this.state.price).toFixed(2)}</span></h1>
                    </div>

                    {/* menu-panel */}
                    <div id='menu-panel'>

                        <div id='menu-grid'>
                            
                            {this.state.email ?
                                <button id='orders-btn'>Orders</button>
                                : <div/>}
                            
                            <div id='dropdown-menu'>
                                <Menu id='menu-btn' onClick={this.toggleDropdown}></Menu>
                                {this.state.email ?
                                    <div id='menu-list'>
                                        <p>{this.state.name}</p>
                                        <button onClick={() => { this.signOut(); this.toggleDropdown(); }} 
                                                type='button'>Sign Out</button>
                                    </div>
                                    : 
                                    <div id='menu-list'>
                                        <button onClick={() => { this.toggleSignInPopup(); this.toggleDropdown(); }} 
                                                type='button'>Sign In</button>
                                        <button onClick={() => { this.toggleSignUpPopup(); this.toggleDropdown(); }} 
                                                 type='button'>Sign Up</button>
                                    </div>}
                            </div>
                        </div>

                    </div>
                    
                    <SignIn setEmailAndName={this.setEmailAndName} toggleSignInPopup={this.toggleSignInPopup}></SignIn>
                    
                    <SignUp setEmailAndName={this.setEmailAndName} toggleSignUpPopup={this.toggleSignUpPopup}></SignUp>
        
                    {/* chart-panel */}
                    <div id='chart-panel' className='framed'>
                        <Chart price={this.state.price}></Chart>
                    </div>

                    {/* txn-panel (transaction) */}
                    <div id='txn-panel' className='framed'>

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
                                <p id='amountUSD' className='value'>{((this.state.orderType === orderTypes.MARKET_ORDER ? this.state.price : this.state.orderPrice) 
                                                                        * this.state.orderAmount).toFixed(2)}</p>

                                <p id='amountUSDUnit' className='name'> USD</p>
                            </div>

                            {/* leverage */}
                            <label>Leverage</label>

                            <div id='levRatios-grid'>
                                {/* 4 leverage levels */}
                                {levRatios.map((levRatio, i) => 
                                    <button id={'levRatio-'+i} className={(this.state.leverage == levRatio)  ? 'levRatio-btn selected' : 'levRatio-btn'} 
                                        onClick={this.setLeverage} key={levRatio}>
                                        {levRatio.toFixed(1)} ×
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

                    {/* balance-panel */}
                    {this.state.email ?
                    // signed in
                        <div id='balance-panel' className='framed'>
                            <h2 id='balance-heading' className='large'>Balance</h2>
                            <div id='balance-grid'>
                                <p className='name'>Total</p>
                                <p className='value'>{(this.state.balance.cash + (this.state.balance.BTC * this.state.price)).toFixed(0)} USD</p>
                                <p className='name'>Cash</p>
                                <p className='value'>{this.state.balance.cash.toFixed(0)} USD</p>
                                <p className='name btcBalance'>BTC</p>
                                <p className='value btcBalance'>{this.state.balance.BTC} BTC</p>
                            </div>
                        </div>
                    // not signed in
                    :   <div id='balance-panel-alt' className='framed'>
                            <button onClick={this.toggleSignInPopup} type='button'>Sign In</button>
                            <button onClick={this.toggleSignUpPopup} type='button'>Sign Up</button>
                        </div>}

                </div>
                
            </div>
        );
    };
};

export default Trading;
