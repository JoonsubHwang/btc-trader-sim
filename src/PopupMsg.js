import React from 'react';
import { CheckCircle, ErrorOutline } from '@material-ui/icons';
import './PopupMsg.css';

export default class PopupMsg extends React.Component {
    
    render = () =>
        <div id='PopupMsg-main'>
            
            {/* success/error icon */}
            {this.props.success ?
            <CheckCircle id='success-icon'/>
            : <ErrorOutline id='error-icon'/>}

            <div>
                {/* Success/Error */}
                <p>{this.props.success ?
                <span id='success'>Success </span>
                : <span id='error'>Error </span>}
                {/* message */}
                {this.props.message}</p>
            </div>

        </div>
}