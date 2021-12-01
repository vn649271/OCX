import { Link } from "react-router-dom";

import Header from "../common/Header";
import Footer from "../common/Footer";
import ApexChart from "../common/exchange/ApexChart";
import ExchangeSwap from "../common/exchange/ExchangeSwap";

export default function Exchange() {
    return (
        <div>
            <Header />
            <div className="main-container py-20">
                <div className="flex">
                    <div className="auth-btn_group rounded-full flex mx-auto">
                        <Link to="/exchange">
                            <p className="exchange-btn  capitalize main-font font-20 cursor-pointer m-0 hover-transition px-5  border-2 border-r-0 blue-border button-bg main-font text-white ">Exchange</p>
                        </Link>
                        <Link to="/liquidity">
                            <p className="liquidity-btn capitalize font-20 main-font cursor-pointer  m-0 hover-transition px-5   border-2 blue-border main-color-blue ">Liquidity</p>
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
