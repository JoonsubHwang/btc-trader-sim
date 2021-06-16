import React, {Component} from 'react';
import Chart from './Chart';
import { CbProAPI } from './CbProAPI';
import './Trading.css';

class Trading extends Component {

    // constructor
    constructor(props) {

        super(props);

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
            orderAmountBTC: 0,
            orderAmountUSD: 0
        }
    }

    componentDidMount() {
        // set update timer
        this.tUpdate = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount() {
        clearInterval(this.update);
    }



    // update
    update = () => {

        // TODO: loadTick instead of OrderBook
        CbProAPI.loadOrderBook()
        .then(orderBook => {

            // change color of price when changed
            if (orderBook.asks[0].price > this.state.price)
                this.setState({ priceColor: 'green' });
            else if (orderBook.asks[0].price < this.state.price)
                this.setState({ priceColor: 'red' });
            else 
                this.setState({ priceColor: 'white' });

            // store orderBook data
            this.setState({ 
                price: orderBook.asks[0].price,
            });
        })
    }


    // event handlers

    setOrderType = (event) => {
        event.preventDefault();
        this.setState({ orderType: event.target.innerHTML });
    }

    switchBuySell = (event) => {
        event.preventDefault();
        this.setState({ buy: !this.state.buy });
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
                                <input className='value' type='number' name='orderPrice' step={this.priceStep} defaultValue='0'></input>
                                <p className='name'> USD</p>
                            </div>

                            <label htmlFor='orderAmount'>Amount</label>
                            <div id='orderAmount-grid'>
                                {/* TODO: set value in a function instead */}
                                <input className='value' type='number' name='orderAmount' step={((this.state.cash + (this.state.price * this.state.BTCWallet)) / 10 / this.state.price).toFixed(3)}></input>
                                <p className='name'> BTC</p>
                                <p className='value'>= {(this.state.orderPrice * this.state.orderAmountBTC).toFixed(2)}</p>
                                <p className='name'> USD</p>
                            </div>

                            <button id='order-btn'>Make Order</button>

                        </form>

                    </div>

                    {/* balance-panel */}
                    <div id='balance-panel' className='container framed'>

                        <h2 id='balance-heading'>Balance</h2>
                        
                        <div id='balance-grid'>
                            <p className='name'>Total</p>
                            <p className='value'>{(this.state.cash + (this.state.BTCWallet * this.state.price)).toFixed(2)} USD</p>
                            <p className='name'>Cash</p>
                            <p className='value'>{this.state.cash} USD</p>
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
