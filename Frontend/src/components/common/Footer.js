import mainLogo from './assets/images/logo/logo.png';

export default function Footer() {
    return (
        <div className="main-footer py-20 bg-white">
            <div className="main-container flex justify-between">
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">ABOUT</p>
                    <ul className="sc-hkeOVe fNpLiB">
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Contact</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Brand</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Blog</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Community</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">CAKE token</a>
                        </li>
                        <li className="main-font font-18 main-color"><span className="">—</span></li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="main-color-blue">Online Store</a>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">HELP</p>
                    <ul className="sc-hkeOVe fNpLiB">
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Customer Support</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Troubleshooting</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Guides</a>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">DEVELOPERS</p>
                    <ul className="sc-hkeOVe fNpLiB">
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Github</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Documentation</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Bug Bounty</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Audits</a>
                        </li>
                        <li className="main-font font-18 main-color">
                            <a href="#" className="">Careers</a>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left footer-logo">
                    <a href="#">
                        <div className="main-logo flex items-center hover-transition">
                            <div className="mr-5">
                                <img src={mainLogo} alt="main-logo" width="60" />
                            </div>
                            <span className="main-logo_text font-30 main-color logo-font uppercase">
                                Open Chain
                            </span>
                        </div>
                    </a>
                </div>
            </div>
        </div >
    );
}
