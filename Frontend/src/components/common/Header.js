import mainLogo from './assets/images/logo/logo.png';
import { Link } from "react-router-dom";
import React from 'react';


async function handleLogout() {
    window.localStorage.clear();
    window.location.href = "/";
}


export default function Header(props) {
    return (
        <header className="bg-white py-3">
            <div className="flex justify-between items-center px-40 ">
                <div className="flex items-center">
                    <Link to="/home">
                        <div className="main-logo flex items-center hover-transition">
                            <div className="mr-5">
                                <img src={mainLogo} alt="main-logo" width="30" />
                            </div>
                            <span className="main-logo_text font-20 main-color logo-font uppercase ">
                                Open Chain
                            </span>
                        </div>
                    </Link>
                    <div className="header-navgation flex items-center font-16 main-color main-font ml-20">
                        <Link to="/exchange"> <span className="header-nav_items main-color px-5 py-2">Exchange</span></Link>
                        <Link to="#"> <span className="header-nav_items main-color px-5 py-2">News</span></Link>
                        <Link to="#"> <span className="header-nav_items main-color px-5 py-2">About Us</span></Link>
                        <Link to="/sign"> <span className="header-nav_items main-color px-5 py-2">Whitepapaer</span></Link>
                        <Link to="/signup"> <span className="header-nav_items main-color px-5 py-2">Contact</span></Link>
                    </div>
                </div>

                <div className="header-right flex items-center">
                    <div className="profile-dropdown-menu p-10 header-dropdown hidden">
                        <div className="dropdown inline-block relative w-full">
                            <button className="profile-dropdown-btn capitalize main-font font-14 cursor-pointer m-0  px-5  border-2 blue-border main-color-blue flex items-center hover-bg-blue hover:text-white">
                                <span className="mr-1">Account</span>
                                <svg className="fill-current h-4 w-4 ml-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /> </svg>
                            </button>
                            <ul className="dropdown-menu absolute hidden pt-1 border-2 blue-border rounded-lg">
                                <li className="mt-3"> <Link to="#">   <p className="profile-dropdown-item border-b-2 rounded-none capitalize main-font font-14 hover-bg-blue hover:text-white cursor-pointer m-0  px-5  main-color-blue ">Account Setting</p></Link></li>
                                <li className="mt-3"> <Link to="#">   <p className="profile-dropdown-item border-b-2 rounded-none capitalize main-font font-14 hover-bg-blue hover:text-white cursor-pointer m-0  px-5  main-color-blue ">Profile</p></Link></li>
                                <li className="mt-3"> <button type="button" className="profile-dropdown-item border-b-2 rounded-none w-full text-left block capitalize main-font font-14 hover-bg-blue hover:text-white cursor-pointer m-0  px-5  main-color-blue" onClick={handleLogout} >Log Out</button> </li>
                            </ul>
                        </div>
                    </div>
                    <div className="auth-btn_group rounded-full flex">
                        <Link to="/login">   <p className="login-btn capitalize main-font font-14 cursor-pointer m-0 hover-transition px-5  border-2 blue-border main-color-blue ">login</p></Link>
                        <Link to="/register">  <p className="signup-btn capitalize font-14 main-font cursor-pointer  m-0 hover-transition px-5   border-2 blue-border main-color-blue ">sign up</p></Link>
                    </div>
                </div>
            </div>
        </header >
    );
}
