import React, { Component } from 'react';

class MyAssetsPage extends Component {

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
            <div className="my-assets-page ml-100">
                <h1> My Assets </h1>
            </div>
        );
    }

}

export default MyAssetsPage;


