import React from 'react';
import { Menu } from '@material-ui/icons';
import Chart from './Chart';
import Transaction from './Transaction'
import SignIn from './SignIn';
import SignUp from './SignUp';
import './TraderSim.css';
import CbProAPI from './client-modules/CbProAPI';

class TraderSim extends React.Component {

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
            priceColor: 'white'
        }
    }

    componentDidMount = () => {

        window.onkeydown = this.closePopupsOnEsc;

        // load data
        this.update();
        // set update timer
        this.tUpdate = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount = () => {
        clearInterval(this.tUpdate);
    }



    // render
    render() {

        return (
            <div id='traderSim-main'>

                <div id='traderSim-grid'>

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


                    {/* chart-panel */}
                    <div id='chart-panel' className='framed'>
                        <Chart price={this.state.price}></Chart>
                    </div>


                    {/* Transaction */}
                    <Transaction price={this.state.price} email={this.state.email} balance={this.state.balance}></Transaction>


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
                        

                    {/* hiddle pop-ups */}
                    <SignIn setEmailAndName={this.setEmailAndName} toggleSignInPopup={this.toggleSignInPopup}></SignIn>
                    <SignUp setEmailAndName={this.setEmailAndName} toggleSignUpPopup={this.toggleSignUpPopup}></SignUp>

                </div>
                
            </div>
        );
    };



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

    closePopupsOnEsc = (event) => {
        const key = event.which || event.keyCode;
        if (key == 27) {
            // dropdown
            if (document.querySelector('#menu-list').classList.contains('visible'))
                this.toggleDropdown();
            // sign in
            if (document.querySelector('#signin-main').classList.contains('visible'))
                this.toggleSignInPopup();
            // sign up
            if (document.querySelector('#signup-main').classList.contains('visible'))
                this.toggleSignUpPopup();
            // TODO: pop-up message
        }
    }


    toggleDropdown = () => {
        document.querySelector('#menu-list').classList.toggle('visible');
    };

    toggleSignInPopup = () => {

        let signin = document.querySelector('#signin-main');

        // hide valiidation messages on close
        if (signin.classList.contains('visible'))
            (signin.querySelectorAll('input')).forEach(field => {
                if (field.validationMessage != '')
                    field.setCustomValidity('');
            });

        // open/close
        signin.classList.toggle('visible');
    };

    toggleSignUpPopup = () => {

        let signup = document.querySelector('#signup-main');

        // hide valiidation messages on close
        if (signup.classList.contains('visible'))
            (signup.querySelectorAll('input')).forEach(field => {
                if (field.validationMessage != '')
                    field.setCustomValidity('');
            });

        // open/close
        signup.classList.toggle('visible');
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
};

export default TraderSim;
