import mainLogo from './assets/images/logo/logo.png';

export default function Footer() {
    return (
        <div className="main-footer py-20 bg-white">
            <div className="main-container flex justify-between">
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">ABOUT</p>
                    <ul class="sc-hkeOVe fNpLiB">
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Contact</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Brand</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Blog</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Community</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">CAKE token</a>
                        </li>
                        <li class="main-font font-18 main-color"><span class="">—</span></li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="main-color-blue">Online Store</a>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">HELP</p>
                    <ul class="sc-hkeOVe fNpLiB">
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Customer Support</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Troubleshooting</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Guides</a>
                        </li>
                    </ul>
                </div>
                <div className="footer-col text-left">
                    <p className="footer-col_title main-color-blue font-24 mian-bold">DEVELOPERS</p>
                    <ul class="sc-hkeOVe fNpLiB">
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Github</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Documentation</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Bug Bounty</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Audits</a>
                        </li>
                        <li class="main-font font-18 main-color">
                            <a href="#" class="">Careers</a>
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
