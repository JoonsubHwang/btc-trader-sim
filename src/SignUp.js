import React from 'react';
import { Close } from '@material-ui/icons';
import './SignUp.css';

export default class SignUp extends React.Component {

    submitSignUp = (event) => {

        event.preventDefault();

        const form = document.querySelector('#signup-form');
        const invalids = form.querySelector(':invalid');

        if (!invalids) {

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
                    this.props.toggleSignUpPopup();
                    // TODO: use popup to alert success
                }
                // on sign in fail
                else if (result.invalid) {
                    if (result.invalid.email) {
                        let emailFld = document.getElementsByName('email')[0];
                        emailFld.setCustomValidity(result.invalid.email);
                        emailFld.reportValidity();
                    }
                    if (result.invalid.password) {
                        let passwordFld = document.getElementsByName('password')[0];
                        passwordFld.setCustomValidity(result.invalid.password);
                        passwordFld.reportValidity();
                    }
                }
                // on server error
                else
                    throw new Error(result.error);
            })
            .catch(err => {
                alert(err); // TODO: display better
            });
        }
    }

    updateValidity = () => {

        console.log('check')

        const form = document.querySelector('#signup-form');

        let email = form.querySelector('input[name="email"]');
        email.setCustomValidity();
        email.checkValidity();
        email.reportValidity();

        let password = form.querySelector('input[name="password"]');
        password.setCustomValidity();
        password.checkValidity();
        password.reportValidity();

        let pwConfirm = form.querySelector('input[name="pwConfirm"]');
        pwConfirm.setCustomValidity();
        pwConfirm.checkValidity();
        if (pwConfirm.value !== password.value)
            pwConfirm.setCustomValidity('passwords don\'t match');
        pwConfirm.reportValidity();
    }

    render () {
        return (
            <div id='signup-main'>
                <div id='signup-popup' className='container framed'>

                    <Close id='signupClose-btn' onClick={this.props.toggleSignUpPopup}></Close>

                    <form id='signup-form'>

                        <p id='signup-heading' className='large'>Sign Up</p>

                        <p>E-mail</p>

                        <input name='email' onBlur={this.updateValidity} 
                                type='email' required={true} placeholder='username@domain.com'></input>

                        <p>Password</p>

                        <input name='password' onBlur={this.updateValidity} 
                                type='password' minLength={8} required={true} placeholder='8_characters_at_min'></input>

                        <p>Confirm</p>

                        <input name='pwConfirm' onBlur={this.updateValidity} 
                                type='password' minLength={8} required={true} placeholder='Confirm password'></input>

                        <button id='signup-btn' onBlur={this.submitSignUp}>Sign Up</button>

                    </form>
                </div>
            </div>
        )
    }

}