import React from 'react';
import { Link } from 'react-router-dom';
import { Close } from '@material-ui/icons';
import './SignIn.css';

export default class SignIn extends React.Component {

    submitSignIn = (event) => {

        event.preventDefault();

        const form = document.querySelector('#signin-form');
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
                    form.reset();
                    this.props.setEmailAndName(result.email, result.name);
                    this.props.toggleSignInPopup();
                    // TODO: use popup to alert success
                }
                // on sign in fail
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
                alert(err); // TODO: display better
            });
        }
    }

    updateValidity = (event) => {
        let field = event.target;
        field.setCustomValidity('');
        field.checkValidity();
        field.reportValidity();
    }

    render () {
        return (
            <div id='signin-main'>
                <div id='signin-popup' className='container framed'>

                    <Close id='signinClose-btn' onClick={this.props.toggleSignInPopup}></Close>

                    <form id='signin-form'>

                        <p id='signin-heading' className='large'>Sign In</p>

                        <p>E-mail</p>

                        <input name='email' onBlur={this.updateValidity} type='email' required={true} placeholder='username@domain.com' />

                        <p>Password</p>

                        <input name='password' onBlur={this.updateValidity} type='password' minLength={8} required={true} placeholder='password' />

                        <button id='signin-btn' onClick={this.submitSignIn}>Sign In</button>

                        <Link className='small' to='/not-implemented'>Forgot password?</Link>

                    </form>
                </div>
            </div>
        )
    }

}