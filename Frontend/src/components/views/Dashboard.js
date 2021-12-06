import React, { Component } from "react";

import Header from "../common/Header";
import Footer from "../common/Footer";

import MobileNav from "../common/MobileNav";


export default class Dashboard extends Component {
    
    componentDidMount() {
        this.rmCheck = document.getElementById("rememberMe");
        this.emailInput = document.getElementById("username");
    }

    render() {
        return (
            <div>
                <Header />
                <Footer />
                <MobileNav />
            </div>
        );
    }
}
