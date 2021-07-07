import React from 'react';
import { Link } from 'react-router-dom';
import { Close } from '@material-ui/icons';
import './SignIn.css';

export default class SignIn extends React.Component {

    submitSignIn = (event) => {

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
            };

            fetch('/sign-in', req)
            .then(res => res.json())
            .then(result => {
                // on successful sign in
                if (result.email) {
                    this.props.setEmail(result.email);
                    // TODO: call loadName from Trading
                    // TODO: call loadBalance from Trading
                    this.props.toggleSignInPopup();
                }
                // on sign in fail
                else if (result.invalid) {
                    // TODO: display better
                    if (result.invalid.email) {
                        let emailFld = document.getElementsByName('email')[0];
                        emailFld.setCustomValidity(result.invalid.email);
                        emailFld.reportValidity();
                        emailFld.setCustomValidity(''); // TODO: remove and set onChange=check-again
                    }
                    if (result.invalid.password) {
                        let passwordFld = document.getElementsByName('password')[0];
                        passwordFld.setCustomValidity(result.invalid.password);
                        passwordFld.reportValidity();
                        passwordFld.setCustomValidity(''); // TODO: remove and set onChange=check-again
                    }
                }
                // on server error
                // TODO: check status code?
                else {
                    throw new Error(result.error);
                }
            })
            .catch(err => {
                alert(err); // TODO: display better
            });
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

                        <input name='email' type='email' required={true} placeholder='username@domain.com'></input>

                        <p>Password</p>

                        <input name='password' type='password' minLength={8} required={true} placeholder='8_characters_at_min'></input>

                        <button id='signin-btn' onClick={this.submitSignIn}>Sign In</button>

                        <Link className='small' to='/not-implemented'>Forgot password?</Link>

                    </form>
                </div>
            </div>
        )
    }

}