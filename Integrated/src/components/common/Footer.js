import mainLogo from './assets/images/logo/logo.png';
import { Link } from "react-router-dom";


export default function Footer() {
    return (
        <div className="main-footer py-20 bg-white">
            <div className="main-container flex justify-between">
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">ABOUT</p>
                    <ul className="sc-hkeOVe fNpLiB">
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Contact</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Brand</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Blog</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Community</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">CAKE token</Link>
                        </li>
                        <li className="main-font font-18 main-color"><span className="">—</span></li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="main-color-blue">Online Store</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">HELP</p>
                    <ul className="sc-hkeOVe fNpLiB">
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Customer Support</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Troubleshooting</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Guides</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">DEVELOPERS</p>
                    <ul className="sc-hkeOVe fNpLiB">
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Github</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Documentation</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Bug Bounty</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Audits</Link>
                        </li>
                        <li className="main-font font-18 main-color">
                            <Link to="/home" className="">Careers</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left footer-logo">
                    <Link to="/home">
                        <div className="main-logo flex items-center hover-transition">
                            <div className="mr-5">
                                <img src={mainLogo} alt="main-logo" width="60" />
                            </div>
                            <span className="main-logo_text font-30 main-color logo-font uppercase">
                                Open Chain
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div >
    );
}
