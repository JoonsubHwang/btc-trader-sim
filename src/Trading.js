import React, {Component} from 'react';
import Chart from './Chart';
import { CbProAPI } from './CbProAPI';
import './Trading.css';

const white = 'rgb(250, 250, 250)';
const green = 'rgb(20, 180, 140)';
const red = 'rgb(250, 70, 90)';

class Trading extends Component {

    // constructor
    constructor(props) {

        super(props);

        this.iUpdate = 500; // interval for updating (ms)

        this.state = {
            price: 0,
            priceColor: white,
            balance: this.props.balance,
            BTCOwned: 5,
            valueOwning: 0,
            asks: [],
            bids: []
        }
    }



    componentDidMount() {
        // set update timer
        // this.tUpdate = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount() {
        clearInterval(this.update);
    }



    // update
    update = () => {

        CbProAPI.loadOrderBook()
        .then(orderBook => {

            // change color of price when changed
            if (orderBook.asks[0].price > this.state.price)
                this.setState({ priceColor: green });
            else if (orderBook.asks[0].price < this.state.price)
                this.setState({ priceColor: red });
            else 
                this.setState({ priceColor: white });

            // store orderBook data
            this.setState({ 
                price: orderBook.asks[0].price,
                asks: orderBook.asks,
                bids: orderBook.bids,
                valueOwning: this.state.BTCOwned * this.state.price
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
                        
                        <h1 id='price' style={{ color: this.state.priceColor }}>BTC-USD ${this.state.price}</h1>
        
                    </div>

                    {/* menu-panel */}
                    <div id='menu-panel'>

                    </div>
        
                    {/* chart-panel */}
                    <div id='chart-panel' className='container framed'>
                        <Chart price={this.state.price}></Chart>
                    </div>

                    {/* ordBook-panel */}
                    <div id='ordBook-panel' className='container framed'>

                    </div>

                    {/* txn-panel (transaction) */}
                    <div id='txn-panel' className='container framed'>

                    </div>

                    {/* balance-panel */}
                    <div id='balance-panel'>
                        
                    </div>

                </div>
                
            </div>
        );
    }
}

export default Trading;
