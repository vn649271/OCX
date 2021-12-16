import React, { Component } from 'react';

class LogPage extends Component {

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
            <div className="log-page">
                Log Page
            </div>
        );
    }

}

export default LogPage;