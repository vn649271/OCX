import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import SidebarMenu from "./dashboard/SidebarMenu";
import MobileNav from "../common/MobileNav";
import PageContainer from "./dashboard/PageContainer";

export default class Dashboard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            redirect: null,
            email: localStorage.email,
            token: localStorage.userToken,
            targetPageId: null
        }

        this.validateUser = this.validateUser.bind(this);
        this.onSelectMenuItem = this.onSelectMenuItem.bind(this);
    }

    validateUser = token => {
        if (!token)
            return false;
        return true;
    }

    onSelectMenuItem(itemId) {
        this.setState({ targetPageId: itemId });
    }

    componentDidMount() {
        if (!this.validateUser(this.state.token)) {
            this.setState({ redirect: '/login' });
        } else {
            document.getElementsByClassName('auth-btn_group')[0].classList.add('hidden');
            document.getElementsByClassName('header-navgation')[0].classList.add('hidden');
            document.getElementsByClassName('dashboard_name')[0].classList.remove('hidden');
            document.getElementsByClassName('user-logo')[0].classList.remove('hidden');
            document.getElementsByClassName('main-header-content')[0].classList.remove('px-40');
            document.getElementsByClassName('main-header-content')[0].classList.add('px-20');
            document.getElementsByClassName('main-logo')[0].classList.add('mr-20');
            document.getElementsByClassName('message-part')[0].classList.remove('hidden');
            document.getElementsByClassName('main-footer')[0].classList.add('hidden');
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div>
                <Header userToken={this.state.token} />
                <div className="flex">
                    <SidebarMenu onSelectItem={this.onSelectMenuItem} />
                    <PageContainer target={this.state.targetPageId} />
                </div>
                <Footer />
                <MobileNav />
            </div>
        );
    }
}
