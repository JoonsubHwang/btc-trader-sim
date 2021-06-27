import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Close } from '@material-ui/icons';
import './SignIn.css';

export default class SignIn extends Component {

    constructor (props) {
        super(props);
    }

    render () {
        return (
            <div id='signin-main'>
                <div id='signin-popup' className='container framed'>

                    <Close id='close-btn' onClick={this.props.toggleSignInPopup}></Close>

                    <div id='signin-grid'>

                        <p id='signin-heading' className='large'>Sign In</p>

                        <p>E-mail</p>

                        <input name='email' type='text'></input>

                        <p>Password</p>

                        <input name='password' type='text'></input>

                        <button id='signin-btn'>Sign In</button>

                        <Link className='small' to='/not-implemented'>Forgot password?</Link>

                    </div>
                </div>
            </div>
        )
    }

}