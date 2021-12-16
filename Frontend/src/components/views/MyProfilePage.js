import React, { Component } from 'react';

class MyProfilePage extends Component {

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
            <div className="my-profile-page ml-100">
                <h1> My Profile </h1>
            </div>
        );
    }

}

export default MyProfilePage;


