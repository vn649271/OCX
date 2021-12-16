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
            <div className="chat-page">
                Chat Page
            </div>
        );
    }

}

export default ChatPage;


