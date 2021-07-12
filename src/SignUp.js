import React from 'react';
import { Link } from 'react-router-dom';
import { Close } from '@material-ui/icons';
import './SignUp.css';

export default class SignUp extends React.Component {

    submitSignUp = (event) => {

        event.preventDefault();

        const form = document.querySelector('#signup-form');
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
                    this.props.toggleSignUpPopup();
                    // TODO: use popup to alert success
                }
                // on sign in fail
                else if (result.invalid) {
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
                else
                    throw new Error(result.error);
            })
            .catch(err => {
                alert(err); // TODO: display better
            });
        }
    }

    render () {
        return (
            <div id='signup-main'>
                <div id='signup-popup' className='container framed'>

                    <Close id='signupClose-btn' onClick={this.props.toggleSignUpPopup}></Close>

                    <form id='signup-form'>

                        <p id='signup-heading' className='large'>Sign Up</p>

                        <p>E-mail</p>

                        <input name='email' type='email' required={true} placeholder='username@domain.com'></input>

                        <p>Password</p>

                        <input name='password' type='password' minLength={8} required={true} placeholder='8_characters_at_min'></input>

                        <button id='signup-btn' onClick={this.submitSignUp}>Sign Up</button>

                    </form>
                </div>
            </div>
        )
    }

}