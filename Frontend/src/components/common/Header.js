import mainLogo from './assets/images/logo/logo.png';

export default function Header() {
    return (
        <header className="bg-white py-3">
            <div className="flex justify-between items-center px-40 ">
                <div className="flex items-center">

                    <a href="/home">
                        <div className="main-logo flex items-center hover-transition">
                            <div className="mr-5">
                                <img src={mainLogo} alt="main-logo" width="30" />
                            </div>
                            <span className="main-logo_text font-20 main-color logo-font uppercase ">
                                Open Chain
                            </span>
                        </div>
                    </a>
                    <div className="header-navgation flex items-center font-16 main-color main-font ml-20">
                        <a href="/exchange"> <span className="header-nav_items main-color px-5 py-2">Exchange</span></a>
                        <a href="#"> <span className="header-nav_items main-color px-5 py-2">News</span></a>
                        <a href="#"> <span className="header-nav_items main-color px-5 py-2">About Us</span></a>
                        <a href="#"> <span className="header-nav_items main-color px-5 py-2">Whitepapaer</span></a>
                        <a href="#"> <span className="header-nav_items main-color px-5 py-2">Contact</span></a>
                    </div>
                </div>

                <div className="header-right flex items-center">
                    <div className="auth-btn_group rounded-full flex ">
                        <p className="login-btn capitalize main-font font-14 cursor-pointer m-0 hover-transition px-5  border-2 blue-border main-color-blue ">log in</p>
                        <p className="signup-btn capitalize font-14 main-font cursor-pointer  m-0 hover-transition px-5   border-2 blue-border main-color-blue ">sign up</p>
                    </div>
                </div>
            </div>
        </header >
    );
}
