import React, {Component} from 'react';
import Chart from './Chart';
import { Menu } from '@material-ui/icons';
import { CbProAPI } from './CbProAPI';
import './Trading.css';

class Trading extends Component {

    // constructor
    constructor(props) {

        super(props);

        // constants
        this.iUpdate = 500; // interval for updating (ms)
        this.orderTypes = {
            LIMIT_ORDER: 'Limit order',
            MARKET_ORDER: 'Market order',
            STOP_MARKET: 'Stop market'
        }
        this.priceStep = 100; // dolalrs

        this.state = {
            price: 0,
            priceColor: 'white',
            cash: 1000, // TODO: temporary value
            BTCWallet: 50.1231, // TODO: temporary value
            buy: true, // false = sell
            orderPrice: 0,
            orderType: this.orderTypes.LIMIT_ORDER,
            IOC: false, // immedate or cancel
            orderAmount: 0 //  BTC
        }
    }

    componentDidMount() {
        // set update timer
        this.tUpdate = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount() {
        clearInterval(this.tUpdate);
    }



    // update
    update = () => {

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
            console.error(err);
        })
    }


    // event handlers

    setOrderType = (event) => {
        event.preventDefault();

        this.setState({ orderType: event.target.innerHTML });

        if(event.target.innerHTML === this.orderTypes.MARKET_ORDER)
            this.state.orderPrice = this.state.price
    }

    switchBuySell = (event) => {
        event.preventDefault();
        this.setState({ buy: !this.state.buy });
    }

    setOrderPrice = (event) => {
        this.setState({ orderPrice: event.target.value });
    }

    setOrderAmount = (event) => {
        this.setState({ orderAmount: event.target.value });
    }

    submitOrder = (event) => {

        event.preventDefault();

        if (this.state.orderType === this.orderTypes.MARKET_ORDER)
            this.state.orderPrice = this.state.price;

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
            console.log(err);
        })
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
                            <button id='orders-btn'>Orders</button>
                            <Menu id='menu-btn'></Menu>
                        </div>

                    </div>
        
                    {/* chart-panel */}
                    <div id='chart-panel' className='container framed'>
                        <Chart price={this.state.price}></Chart>
                    </div>

                    {/* txn-panel (transaction) */}
                    <div id='txn-panel' className='container framed'>

                        <button id='buy-btn'  className={this.state.buy ? 'selected' : ''} onClick={this.switchBuySell}>BUY</button>
                        <button id='sell-btn' className={this.state.buy ? '' : 'selected'} onClick={this.switchBuySell}>SELL</button>

                        <form id='order-form'>

                            <label>Order Type</label>

                            <div id='orderTypes-grid'>
                                <button className={this.state.orderType === this.orderTypes.LIMIT_ORDER  ? 'orderType-btn selected' : 'orderType-btn'} 
                                    onClick={this.setOrderType}>
                                        {this.orderTypes.LIMIT_ORDER}
                                </button>
                                
                                <button className={this.state.orderType === this.orderTypes.MARKET_ORDER ? 'orderType-btn selected' : 'orderType-btn'} 
                                    onClick={this.setOrderType}>
                                        {this.orderTypes.MARKET_ORDER}
                                </button>

                                <button className={this.state.orderType === this.orderTypes.STOP_MARKET  ? 'orderType-btn selected' : 'orderType-btn'} 
                                    onClick={this.setOrderType}>
                                        {this.orderTypes.STOP_MARKET}
                                </button>
                            </div>

                            <label htmlFor='orderPrice'>Price</label>
                            <div id='orderPrice-grid'>
                                {this.state.orderType === this.orderTypes.MARKET_ORDER ?
                                    <p id='marketPrice'>Market Price</p>
                                    : <input className='value' type='number' name='orderPrice' step={this.priceStep} value={this.state.orderPrice} min='0' 
                                        onChange={this.setOrderPrice}></input>}
                                <p className='name'> USD</p>
                            </div>

                            <label htmlFor='orderAmount'>Amount</label>
                            <div id='orderAmount-grid'>
                                <input className='value' type='number' name='orderAmount' 
                                    step={((this.state.buy ? (this.state.cash / this.state.orderPrice) : this.state.BTCWallet) * 0.1).toFixed(4)} 
                                    value={this.state.orderAmount} min='0' 
                                    max={this.state.buy ? this.state.cash / this.state.orderPrice : this.state.BTCWallet} 
                                    onChange={this.setOrderAmount}></input>
                                <p className='name'> BTC</p>
                                <p className='value'>≈ {((this.state.orderType === this.orderTypes.MARKET_ORDER ? this.state.price : this.state.orderPrice) 
                                                            * this.state.orderAmount).toFixed(2)}</p>
                                <p className='name'> USD</p>
                            </div>

                            <button id='order-btn' onClick={this.submitOrder}>Make Order</button>

                        </form>

                    </div>

                    {/* balance-panel */}
                    <div id='balance-panel' className='container framed'>

                        <h2 id='balance-heading'>Balance</h2>
                        
                        <div id='balance-grid'>
                            <p className='name total'>Total</p>
                            <p className='value total'>{(this.state.cash + (this.state.BTCWallet * this.state.price)).toFixed(0)} USD</p>
                            <p className='name'>Cash</p>
                            <p className='value'>{this.state.cash.toFixed(0)} USD</p>
                            <p className='name'>BTC Wallet</p>
                            <div id='BTCWallet-grid'>
                                <p className='value'>{this.state.BTCWallet} BTC</p>
                                <p className='value'>≈ {(this.state.BTCWallet * this.state.price).toFixed(0)} USD</p>
                            </div>
                        </div>

                    </div>

                </div>
                
            </div>
        );
    }
}

export default Trading;
