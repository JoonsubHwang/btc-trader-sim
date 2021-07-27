import React from 'react';
import { Close } from '@material-ui/icons';
import './Orders.css';

export default class Orders extends React.Component {

    render = () =>
        <div id='orders-main'>
            <div id='orders-popup'>

                <Close id='ordersClose-btn' onClick={this.props.toggleOrdersPopup}></Close>

                <div id='orders-content'>

                    <h2 id='orders-heading' className='large'>Order History</h2>

                    <div id='orders-frame'>
                        {(this.props.orderHistory) ?
                            ( (this.props.orderHistory.length > 0) ?
                                this.props.orderHistory.map(order => {

                                    const time = new Date(order.orderTime).toLocaleString('en-US');

                                    return  <div key={'order-' + order._id}>
                                                {order.buy ?
                                                <p className='green'>BUY</p>
                                                : <p className='red'>SELL</p>}
                                                <p className='value'>{order.orderType.substring(0,6)}</p>
                                                <p className='value'>{order.orderPrice.toFixed(2)}</p>
                                                <p className='value'>{order.orderAmount.toFixed(3)}</p>
                                                <p className='value'>{time.substring(0,time.length-6) + time.substring(time.length-3, time.length)}</p>
                                            </div>
                                })
                                : <p id='noOrder-msg'>No order has been made.</p>
                            )
                            : <p id='noOrder-msg'>Order history is undefined.</p>
                        }
                    </div>

                </div>

            </div>
        </div>
}