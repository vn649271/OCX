import React, { Component } from 'react';

class MyWalletPage extends Component {

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
            <div className="my-wallet-page ml-100">
                <h1> My Wallet </h1>
            </div>
        );
    }

}

export default MyWalletPage;


