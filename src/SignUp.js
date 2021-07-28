import React from 'react';
import { Close } from '@material-ui/icons';
import './SignIn_SignUp.css';

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
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password')
                }) 
            };

            fetch('/sign-up', req)
            .then(res => res.json())
            .then(result => {
                // on successful sign up
                if (result.email) {
                    form.reset();
                    this.props.setEmailAndName(result.email, result.name);
                    this.props.toggleSignUpPopup();
                    this.props.displayPopupMsg(true, 'Sign up complete. Signed in as ' + result.name + '.');
                }
                // on sign up fail
                else if (result.invalid)
                    for (const field in result.invalid) {
                        let input = form.querySelector(`input[name="${field}"]`);
                        input.setCustomValidity(result.invalid[field]);
                        input.reportValidity();
                    }
                // on server error
                else
                    throw new Error(result.error);
            })
            .catch(err => {
                this.props.displayPopupMsg(false, err.message);
            });
        }
    }

    updateValidity = (event) => {

        let field = event.target;

        field.setCustomValidity('');
        field.checkValidity();

        if (field.name === 'pwConfirm') {
            const password = document.querySelector('#signup-form').querySelector('input[name="password"]');
            if (password.value !== field.value)
                field.setCustomValidity('Passwords don\'t match.');
        }

        field.reportValidity();
    }

    render () {
        return (
            <div id='signup-main'>
                <div id='signup-popup' className='container framed'>

                    <Close id='signupClose-btn' className='icon' onClick={this.props.toggleSignUpPopup}></Close>

                    <form id='signup-form'>

                        <p id='signup-heading' className='large'>Sign Up</p>

                        <p>Name</p>

                        <input name='name' onBlur={this.updateValidity} 
                                type='text'  minLength={1} maxLength={9} required={true} placeholder='name_or_nickname' />

                        <p>E-mail</p>

                        <input name='email' onBlur={this.updateValidity} 
                                type='email' required={true} placeholder='username@domain.com' />

                        <p>Password</p>

                        <input name='password' onBlur={this.updateValidity} 
                                type='password' minLength={8} maxLength={30} pattern={/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/} required={true} placeholder='UPPER_lower_123' />

                        <p></p>

                        <input name='pwConfirm' onBlur={this.updateValidity} 
                                type='password' minLength={8} required={true} placeholder='Confirm password' />

                        <button id='signup-btn' onClick={this.submitSignUp}>Sign Up</button>

                    </form>
                </div>
            </div>
        )
    }

}