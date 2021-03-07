import React, {Component} from 'react';
import Chart from './Chart';

class Trading extends Component {

    // constructor
    constructor(props) {

        super(props);

        this.iUpdate = 100; // interval for updating = 0.1s

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
        
        this.setState({ 
            price: this.state.price + 1,
            valueOwning: this.state.BTCOwned * this.state.price
        });
    }



    // render
    
    render() {

        return (
            <div id='trading-main'>
                <h1>BTC ${this.state.price}</h1>
    
                <p> Balance: {this.state.balance}</p>
    
                <p> BTC owned: {this.state.BTCOwned} (${this.state.valueOwning})</p>
    
                <Chart></Chart>
            </div>
        );
    }
}

export default Trading;
