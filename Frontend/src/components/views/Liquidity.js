import { Link } from "react-router-dom";

import Header from "../common/Header";
import Footer from "../common/Footer";
import ApexChart from "../common/exchange/ApexChart";
import ExchangeSwap from "../common/exchange/ExchangeSwap";
import MobileNav from "../common/MobileNav";

export default function Liquidity() {
    return (
        <div>
            <Header />
            <div className="main-container py-20">
                <div className="flex">
                    <div className="auth-btn_group rounded-full flex mx-auto pt-20 md:pt-0">
                        <Link to="/exchange">
                            <p className="exchange-btn  capitalize main-font font-20 cursor-pointer m-0 hover-transition px-5  border-2 border-r-0 blue-border main-font main-color-blue ">Exchange</p>
                        </Link>
                        <Link to="/liquidity">
                            <p className="liquidity-btn capitalize font-20 main-font cursor-pointer  m-0 hover-transition px-5   border-2 blue-border main-color-blue button-bg  text-white ">Liquidity</p>
                        </Link>
                    </div>
                </div>
                <div className="exchange-container home-card w-full p-10">
                    <div className="w-full flex exchange-content">
                        <div className="w-full lg:w-2/3 pr-0 lg:pr-10">
                            <ApexChart />
                        </div>
                        <div className="w-full lg:w-1/3">
                            <ExchangeSwap />
                        </div>
                    </div>
                </div>
            </div>
            <MobileNav />
            <Footer />
        </div>
    );
}
