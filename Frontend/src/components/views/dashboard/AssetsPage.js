import React, { Component } from 'react';

class MyAssetsPage extends Component {

    
    constructor(props) {
        super(props);
        this.state = {
            title: null,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <div className="my-assets-page">
                {this.state.title}
            </div>
        );
    }

}

export default MyAssetsPage;


