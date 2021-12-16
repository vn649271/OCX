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
                My Assets Page
            </div>
        );
    }

}

export default MyAssetsPage;


