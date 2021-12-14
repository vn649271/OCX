import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";

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
            // this.setState({ redirect: '/login' });
        } else {
            document.getElementsByClassName('auth-btn_group')[0].classList.add('hidden');
            document.getElementsByClassName('header-navgation')[0].classList.add('hidden');
            document.getElementsByClassName('dashboard_name')[0].classList.remove('hidden');
            document.getElementsByClassName('profile-dropdown-menu')[0].classList.remove('hidden');
            localStorage.setItem("userToken", "");
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div>
                <Header userToken={this.state.token} />
                <div class="flex flex-row h-screen bg-gray-100 text-gray-800">
                    <aside
                        class="dashboard-sidebar w-1/6 md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in bg-main-dark"
                    >
                        <div class="sidebar-content pl-24 pt-40">
                            <ul class="flex flex-col w-full">
                                <li class="my-px block mt-6 ">
                                    <a
                                        href="#"
                                        class="flex flex-row items-center h-10 px-5 py-10 sidebar-items-rounded "
                                    >
                                        <span class="flex items-center justify-center text-white">
                                            <svg
                                                fill="none"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                class="h-10 w-10"
                                            >
                                                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                        </span>
                                        <span class="ml-3 main-font font-20 text-white">Assets</span>
                                    </a>
                                </li>
                                <li class="my-px block mt-6 ">
                                    <a
                                        href="#"
                                        class="flex flex-row items-center h-10 px-5 py-10 sidebar-items-rounded "
                                    >
                                        <span class="flex items-center justify-center text-white">
                                            <svg
                                                fill="none"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                class="h-10 w-10"
                                            >
                                                <path
                                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                                />
                                            </svg>
                                        </span>
                                        <span class="ml-3 main-font font-20 text-white">Wallet</span>
                                    </a>
                                </li>
                                <li class="my-px block mt-6 ">
                                    <a
                                        href="#"
                                        class="flex flex-row items-center h-10 px-5 py-10 sidebar-items-rounded "
                                    >
                                        <span class="flex items-center justify-center text-white">
                                            <svg
                                                fill="none"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                class="h-10 w-10"
                                            >
                                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                            </svg>
                                        </span>
                                        <span class="ml-3 main-font font-20 text-white">Log</span>
                                    </a>
                                </li>
                                <li class="my-px block mt-6 ">
                                    <a
                                        href="#"
                                        class="flex flex-row items-center h-10 px-5 py-10 sidebar-items-rounded "
                                    >
                                        <span class="flex items-center justify-center text-white">
                                            <svg
                                                fill="none"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                class="h-10 w-10"
                                            >
                                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                        </span>
                                        <span class="ml-3 main-font font-20 text-white">Account Profile</span>
                                    </a>
                                </li>
                                <li class="my-px block mt-6 ">
                                    <a
                                        href="#"
                                        class="flex flex-row items-center h-10 px-5 py-10 sidebar-items-rounded "
                                    >
                                        <span class="flex items-center justify-center text-white">
                                            <svg
                                                fill="none"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                class="h-10 w-10"
                                            >
                                                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                        </span>
                                        <span class="ml-3 main-font font-20 text-white">Chat</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </aside>
                    <div class="flex flex-col flex-grow -ml-64 md:ml-0 transition-all duration-150 ease-in">
                        
                    </div>
                </div>
                <Footer />
                <MobileNav />
            </div>
        );
    }
}
