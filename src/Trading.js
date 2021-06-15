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

        this.state = {
            price: 0,
            priceColor: 'white',
            cash: 1000, // TODO: temporary value
            BTCWallet: 50.1231, // TODO: temporary value
            buy: true, // false = sell
            orderPrice: 0,
            orderType: null,
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

                        <button id='buy-button' className='selected'>BUY</button>
                        <button id='sell-button'>SELL</button>

                        <form id='order-form'>

                            <label>Order Type</label>
                            <div id='orderTypes-grid'>
                                <button id='limitOrder-btn' className='orderType-btn selected'>{this.orderTypes.LIMIT_ORDER}</button>
                                <button id='marketOrder-btn' className='orderType-btn'>{this.orderTypes.MARKET_ORDER}</button>
                                <button id='stopMarket-btn' className='orderType-btn'>{this.orderTypes.STOP_MARKET}</button>
                            </div>

                            <label for='orderPrice'>Price</label>
                            <div id='orderPrice-grid'>
                                {/* TODO: set value in a function instead */}
                                <input className='value' type='number' name='orderPrice' value={Math.round(this.state.price / 10) * 10} step='100'></input>
                                <label className='name'> USD</label>
                            </div>

                            <label for='orderAmount'>Amount</label>
                            <div id='orderAmount-grid'>
                                {/* TODO: set value in a function instead */}
                                <input className='value' type='number' name='orderAmount' value={(this.state.cash / 2 / this.state.price).toFixed(3)} step={((this.state.cash + (this.state.price * this.state.BTCWallet)) / 10 / this.state.price).toFixed(3)}></input>
                                <label className='name'> BTC</label>
                                <label className='value'>= {this.state.orderPrice * this.state.orderAmountBTC}</label>
                                <label className='name'> USD</label>
                            </div>

                            <button id='order-btn'>Post Order</button>

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
