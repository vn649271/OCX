import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";

import MobileNav from "../common/MobileNav";

var me = null;

export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        me = this;

        this.state = {
            redirect: null,
            email: localStorage.email,
            token: localStorage.userToken
        }

        this.validateUser = this.validateUser.bind(this);
    }

    validateUser = token => {
        console.log("Dashboard.validateUser(): ", token);

        return true;
    }

    componentDidMount() {
        if (!this.validateUser(this.state.token)) {
            this.setState({ redirect: '/login' });
        } else {
            document.getElementsByClassName('auth-btn_group')[0].classList.add('hidden');
            document.getElementsByClassName('profile-dropdown-menu')[0].classList.remove('hidden');
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div>
                <Header userToken={this.state.token} />
                <Footer />
                <MobileNav />
            </div>
        );
    }
}
