import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Close } from '@material-ui/icons';
import './SignIn.css';

export default class SignIn extends Component {

    submitSignIn(event) {

        event.preventDefault();

        const form = document.querySelector('#signin-form');
        let validity = true;

        form.querySelectorAll('input').forEach(input => {
            if (!input.checkValidity()) {
                validity = false;
                input.reportValidity();
            }
        });

        if (validity) {

            const formData = new FormData(form);

            let req = {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                }) 
            }

            fetch('signin', req)
            .then(res => {
                if (res.redirected)
                    window.location.href = res.url;
                else
                    alert(JSON.stringify(res));
            })
            .catch(err => {
                alert(err);
            })
        }
    }

    render () {
        return (
            <div id='signin-main'>
                <div id='signin-popup' className='container framed'>

                    <Close id='close-btn' onClick={this.props.toggleSignInPopup}></Close>

                    <form id='signin-form'>

                        <p id='signin-heading' className='large'>Sign In</p>

                        <p>E-mail</p>

                        <input name='email' type='text' pattern='.+@.+\..+' required={true} placeholder='username@domain.com'></input>

                        <p>Password</p>

                        <input name='password' type='password' minLength={8} required={true}></input>

                        <button id='signin-btn' onClick={this.submitSignIn}>Sign In</button>

                        <Link className='small' to='/not-implemented'>Forgot password?</Link>

                    </form>
                </div>
            </div>
        )
    }

}