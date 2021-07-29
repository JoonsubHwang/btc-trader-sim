import React from 'react';
import { Menu } from '@material-ui/icons';
import Chart from './Chart';
import Transaction from './Transaction'
import SignIn from './SignIn';
import SignUp from './SignUp';
import PopupMsg from './PopupMsg';
import Orders from './Orders';
import CbProAPI from './client-modules/CbProAPI';
import './TraderSim.css';

class TraderSim extends React.Component {

    // constructor
    constructor(props) {

        super(props);

        // constants
        this.updateTimer = undefined;
        this.iUpdate = 500; // interval for updating (ms)
        this.poupMsgCloseTimer = undefined;
        this.priceStep = 100; // dolalrs

        this.state = {
            // account
            email: null, // present if signed in
            name: null,
            balance: {
                cash: 0,
                BTC: 0
            },
            orderHistory: {},

            // price
            price: 0,
            priceColor: 'white',

            // popupMsg
            popupMsg: {
                success: false,
                message: ''
            }
        }
    }

    componentDidMount = () => {

        window.onkeydown = this.closePopupsOnEsc;

        // load data
        this.update();
        
        // display welcome message after loading
        window.setTimeout(() => {
            this.displayPopupMsg(true, ('Welcome' + ((this.state.email) ? 
                                            (', ' + this.state.name + '!') 
                                            : '! Please sign in to make orders.')));
        }, 2000);
        
        // set update timer
        this.updateTimer = setInterval(this.update, this.iUpdate);
    }

    componentWillUnmount = () => {
        clearInterval(this.updateTimer);
    }



    // render
    render() {

        return (
            <div id='traderSim-main'>

            {/* hidden pop-ups */}
            <SignIn setEmailAndName={this.setEmailAndName} toggleSignInPopup={this.toggleSignInPopup} displayPopupMsg={this.displayPopupMsg}></SignIn>
            <SignUp setEmailAndName={this.setEmailAndName} toggleSignUpPopup={this.toggleSignUpPopup} displayPopupMsg={this.displayPopupMsg}></SignUp>
            <PopupMsg popupMsg={this.state.popupMsg}></PopupMsg>
            <Orders orderHistory={this.state.orderHistory} toggleOrdersPopup={this.toggleOrdersPopup} />

                <div id='traderSim-grid'>

                    {/* price-panel */}
                    <div id='price-panel'>
                        <h1 id='price-heading'>BTC-USD <span className={this.state.priceColor}>${Number(this.state.price).toFixed(2)}</span></h1>
                    </div>


                    {/* menu-panel */}
                    <div id='menu-panel'>

                        <div id='menu-grid'>
                            
                            {this.state.email ?
                                <button id='orders-btn' onClick={this.toggleOrdersPopup}>Orders</button>
                                : <div/>}
                            
                            <div id='dropdown-menu'>
                                <Menu id='menu-btn' className='icon' onClick={this.toggleDropdown}></Menu>
                                {this.state.email ?
                                    <div id='menu-list'>
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
                    <Transaction price={this.state.price} email={this.state.email} balance={this.state.balance} displayPopupMsg={this.displayPopupMsg}></Transaction>


                    {/* balance-panel */}
                    {this.state.email ?
                    // signed in
                        <div id='balance-panel' className='framed'>
                            <h2 id='balance-heading' className='large'>{this.state.name}'s Balance</h2>
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
                orderHistory: {}
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

    // update balance and orderHistory
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
                this.setState( { orderHistory: res.orderHistory });
            }
            // on server error
            else if (res.error)
                throw new Error(res.error);

            // else: no update

        }).catch(err => {
            console.error('Error updating account data. (' + err.message + ')');
        });
    };

    displayPopupMsg = (success, message) => {

        // set success and message
        this.setState({ popupMsg: { success: success, message: message }});
        let popupMsg = document.querySelector('#PopupMsg-main');

        // unhide
        popupMsg.style.display ='grid';
        popupMsg.classList.add('show-popupMsg');
        popupMsg.classList.remove('hide-popupMsg');

        // remove previous hide timer
        clearInterval(this.poupMsgCloseTimer);

        // start hiding after 3 sec
        this.poupMsgCloseTimer = setTimeout(() => {
            popupMsg.classList.add('hide-popupMsg');
            popupMsg.classList.remove('show-popupMsg');
            // completely hide when descend animation finishes
            this.poupMsgCloseTimer = setTimeout(() => {
                popupMsg.style.display ='none';
            }, 400)
        }, 3000)
    }



    // event handlers

    closePopupsOnEsc = (event) => {
        const key = event.which || event.keyCode;
        if (key === 27) {
            // dropdown
            if (document.querySelector('#menu-list').style.display === 'block')
                this.toggleDropdown();
            // sign in
            if (document.querySelector('#signin-main').style.display === 'block')
                this.toggleSignInPopup();
            // sign up
            if (document.querySelector('#signup-main').style.display === 'block')
                this.toggleSignUpPopup();
            // orders
            if (document.querySelector('#orders-main').style.display === 'block')
                this.toggleOrdersPopup();
        }
    }


    toggleDropdown = () => {
        
        let menuList = document.querySelector('#menu-list');

        if (menuList.style.display === 'block') {
            menuList.classList.add('hide-menulist');
            menuList.classList.remove('show-menulist');
            setTimeout(() => {
                menuList.style.display ='none';
            }, 200);
        }
        else {
            menuList.classList.add('show-menulist');
            menuList.classList.remove('hide-menulist');
            menuList.style.display ='block';
        }
    };

    toggleSignInPopup = () => {

        let signinMain = document.querySelector('#signin-main');
        let signinPopup = signinMain.querySelector('#signin-popup');
        // let signinForm = signinPopup.querySelector('#signin-form');

        // on close
        if (signinMain.style.display === 'block') {

            // to hide valiidation messages
            // FIXME signinForm.noValidate = true;

            // trgger animations
            signinMain.classList.add('hide-background');
            signinMain.classList.remove('show-background');
            signinPopup.classList.add('hide-signinupPopup');
            signinPopup.classList.remove('show-signinupPopup');

            // hide (when animations finish)
            setTimeout(() => {
                signinMain.style.display ='none';
            }, 400);
        }
        
        // on open
        else {
            // close dropdown menu
            if (document.querySelector('#menu-list').style.display === 'block')
                this.toggleDropdown();

            // trgger animations
            signinMain.classList.add('show-background');
            signinMain.classList.remove('hide-background');
            signinPopup.classList.add('show-signinupPopup');
            signinPopup.classList.remove('hide-signinupPopup');

            // unhide
            signinMain.style.display ='block';

            // focus on the first field (when animations finish)
            window.setTimeout(() => {
                signinMain.querySelector("input[name='email']").focus();
                // FIXME turn validation back on
                // signinForm.noValidate = false;
            }, 800);
        }
    };

    toggleSignUpPopup = () => {

        let signupMain = document.querySelector('#signup-main');
        let signupPopup = signupMain.querySelector('#signup-popup');
        // let signupForm = signupPopup.querySelector('#signup-form');

        if (signupMain.style.display === 'block') {

            // FIXME signupForm.noValidate = true;

            setTimeout(() => {
                signupMain.style.display ='none';
            }, 400)

            signupMain.classList.add('hide-background');
            signupMain.classList.remove('show-background');
            signupPopup.classList.add('hide-signinupPopup');
            signupPopup.classList.remove('show-signinupPopup');
        }
        
        else {
            if (document.querySelector('#menu-list').style.display === 'block')
                this.toggleDropdown();

            signupMain.classList.add('show-background');
            signupMain.classList.remove('hide-background');
            signupPopup.classList.add('show-signinupPopup');
            signupPopup.classList.remove('hide-signinupPopup');

            signupMain.style.display ='block';

            window.setTimeout(() => {
                signupMain.querySelector("input[name='name']").focus();
                // FIXME signupForm.noValidate = false;
            }, 800);
        }
    };

    toggleOrdersPopup = () => {

        let ordersMain = document.querySelector('#orders-main');
        let ordersPopup = ordersMain.querySelector('#orders-popup');

        if (ordersMain.style.display === 'block') {
            
            ordersMain.classList.add('hide-background');
            ordersMain.classList.remove('show-background');
            ordersPopup.classList.add('hide-ordersPopup');
            ordersPopup.classList.remove('show-ordersPopup');

            setTimeout(() => {
                ordersMain.style.display ='none';
            }, 400);
        }
        else {
            if (document.querySelector('#menu-list').style.display === 'block')
                this.toggleDropdown();
            
            ordersMain.classList.add('show-background');
            ordersMain.classList.remove('hide-background');
            ordersPopup.classList.add('show-ordersPopup');
            ordersPopup.classList.remove('hide-ordersPopup');

            ordersMain.style.display ='block';
        }
    }

    signOut = () => {

        fetch('/sign-out', { method: 'POST' })
        .then(res => res.status === 500 ? res.json() : res)
        .then(res => {
            
            // on server error
            if (res.error)
                throw new Error(res.error);

            // on success
            else {
                this.setEmailAndName(null);
                this.displayPopupMsg(true, 'Signed out.');
            }
        })
        .catch(err => {
            this.displayPopupMsg(false, err.message);
        });
    };
};

export default TraderSim;
