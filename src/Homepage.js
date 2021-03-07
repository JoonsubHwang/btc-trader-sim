import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Homepage extends Component {

    render() {
        return (
            <div id='homepage-main'>
                <h1>BTC Trader Sim</h1>
                <Link to='/trading'> Trading </Link>
            </div>
        );
    }
}

export default Homepage;
