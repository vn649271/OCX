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
            <div className="my-log-page ml-100">
                <h1> Log Page </h1>
            </div>
        );
    }

}

export default LogPage;


