import React, { Component } from 'react';

class PaymentPage extends Component {

    state = {
        value: '',
        title: null,
    }

    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <div className="my-profile-page">
                My Profile Page
            </div>
        );
    }

}

export default PaymentPage;


