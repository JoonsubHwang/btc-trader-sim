import React from 'react';
import { CheckCircle, ErrorOutline } from '@material-ui/icons';
import './PopupMsg.css';

export default class PopupMsg extends React.Component {
    
    render = () =>
        <div id='PopupMsg-main'>
            <div id='PopupMsg-grid'>
                
                {/* success/error icon */}
                {this.props.popupMsg.success ?
                <CheckCircle id='success-icon'/>
                : <ErrorOutline id='error-icon'/>}

                <div>
                    {/* Success/Error */}
                    <p>{this.props.popupMsg.success ?
                    <span id='success'>Success </span>
                    : <span id='error'>Error </span>}
                    {/* message */}
                    {this.props.popupMsg.message}</p>
                </div>

            </div>
        </div>
}