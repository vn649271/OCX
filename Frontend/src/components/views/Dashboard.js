import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import SidebarMenu from "../common/SidebarMenu";
import MobileNav from "../common/MobileNav";

// var me = null;

export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        // me = this;

        this.state = {
            redirect: null,
            email: localStorage.email,
            token: localStorage.userToken
        }

        this.validateUser = this.validateUser.bind(this);
    }

    validateUser = token => {
        console.info("Dashboard.validateUser(): token=", token);
        if (!token)
            return false;
        return true;
    }

    componentDidMount() {
        if (!this.validateUser(this.state.token)) {
            this.setState({ redirect: '/login' });
        } else {
            document.getElementsByClassName('auth-btn_group')[0].classList.add('hidden');
            document.getElementsByClassName('header-navgation')[0].classList.add('hidden');
            document.getElementsByClassName('dashboard_name')[0].classList.remove('hidden');
            document.getElementsByClassName('user-logo')[0].classList.remove('hidden');
            // localStorage.setItem("userToken", "");
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div>
                <Header userToken={this.state.token} />
                <SidebarMenu />
                <Footer />
                <MobileNav />
            </div>
        );
    }
}
