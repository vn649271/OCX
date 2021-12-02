import mainLogo from './assets/images/logo/logo.png';
import { Link } from "react-router-dom";

export default function Header() {
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
                        <Link to="#"> <span className="header-nav_items main-color px-5 py-2">Whitepapaer</span></Link>
                        <Link to="/signup"> <span className="header-nav_items main-color px-5 py-2">Contact</span></Link>
                    </div>
                </div>

                <div className="header-right flex items-center">
                    <div className="auth-btn_group rounded-full flex ">
                        <Link to="/login">   <p className="login-btn capitalize main-font font-14 cursor-pointer m-0 hover-transition px-5  border-2 blue-border main-color-blue ">log in</p></Link>
                        <Link to="/register">  <p className="signup-btn capitalize font-14 main-font cursor-pointer  m-0 hover-transition px-5   border-2 blue-border main-color-blue ">sign up</p></Link>
                    </div>
                </div>
            </div>
        </header >
    );
}
