import React, { Component } from 'react';
import QRCode from "react-qr-code";
class GamePage extends Component {

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
                <QRCode value="hey" />
            </div>
        );
    }

}

export default GamePage;


