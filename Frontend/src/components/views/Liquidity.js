import { Link } from "react-router-dom";

import Header from "../common/Header";
import Footer from "../common/Footer";
import ApexChart from "../common/exchange/ApexChart";
import ExchangeSwap from "../common/exchange/ExchangeSwap";

export default function Liquidity() {
    return (
        <div>
            <Header />
            <div className="main-container py-20">
                <div className="flex">
                    <div className="auth-btn_group rounded-full flex mx-auto">
                        <Link to="/exchange">
                            <p className="exchange-btn  capitalize main-font font-30 cursor-pointer m-0 hover-transition px-5  border-2 border-r-0 blue-border main-font">Exchange</p>
                        </Link>
                        <Link to="/liquidity">
                            <p className="liquidity-btn capitalize font-30 main-font cursor-pointer  m-0 hover-transition px-5   border-2 blue-border main-color-blue button-bg main-font text-white">Liquidity</p>
                        </Link>
                    </div>
                </div>
                <div className="exchange-container home-card w-full p-10">
                    <div className="w-full flex">
                        <ApexChart />
                        <ExchangeSwap />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
