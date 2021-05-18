import React, {Component} from 'react';
import Chart from './Chart';
import { CbProAPI } from './CbProAPI';

class Trading extends Component {

    // constructor
    constructor(props) {

        super(props);

        this.iUpdate = 500; // interval for updating = 0.5s

        this.state = {
            price: 0,
            balance: this.props.balance,
            BTCOwned: 5,
            valueOwning: 0
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
            this.setState({ 
                price: orderBook.asks[0].price,
                valueOwning: this.state.BTCOwned * this.state.price
            });
            console.log('time: ' + Date.now() + ' price: ' + this.state.price)
        })
    }



    // render
    
    render() {

        return (
            <div id='trading-main'>

                <h1>BTC ${this.state.price}</h1>
    
                {/* <p> Balance: {this.state.balance}</p> */}
    
                {/* <p> BTC owned: {this.state.BTCOwned} (${this.state.valueOwning})</p> */}
    
                <div style={{ width: '80%', height: '50%' }}>
                    <Chart></Chart>
                </div>
                
            </div>
        );
    }
}

export default Trading;
