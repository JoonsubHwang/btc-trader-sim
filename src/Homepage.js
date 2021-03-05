import React from 'react';
import { Link } from 'react-router-dom';

function Homepage() {
    return (
        <div>
            <h1>BTC Trader Sim</h1>
            <Link to='/trading'> Trading </Link>
        </div>
    );
}

export default Homepage;
