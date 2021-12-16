import React, { Component } from 'react';

class ChatPage extends Component {

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
            <div className="my-chat-page ml-100">
                <h1> Chat Page </h1>
            </div>
        );
    }

}

export default ChatPage;


