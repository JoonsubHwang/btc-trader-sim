import React, {Component} from 'react';
import Chart from './Chart';
import { CbProAPI } from './CbProAPI';

const white = 'rgb(250, 250, 250)';
const green = 'rgb(10, 180, 30)';
const red = 'rgb(200, 20, 0)';

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



    // effect hooks

    componentDidMount() {
        this.tUpdate = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount() {
        clearInterval(this.update);
    }



    // functions

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

                {/* pricePanel */}
                <div id='pricePanel' className='container'>
                    
                    <h1 id='price' style={{ color: this.state.priceColor }}>BTC-USD ${this.state.price}</h1>
    
                </div>
    
                {/* <p> Balance: {this.state.balance}</p> */}
    
                {/* <p> BTC owned: {this.state.BTCOwned} (${this.state.valueOwning})</p> */}
    
                {/* chartPanel */}
                <div id='chartPanel' className='container framed'>
                    <Chart price={this.state.price}></Chart>
                </div>

                {/* txnPanel (transaction) */}
                <div id='txnPanel' className='container framed'>

                </div>
                
            </div>
        );
    }
}

export default Trading;
