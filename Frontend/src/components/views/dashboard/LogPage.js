import React, { Component } from 'react';

class LogPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: props.title,
        }
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <div className="log-page">
                {this.state.title}
            </div>
        );
    }

}

export default LogPage;