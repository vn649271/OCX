import Header from "../common/Header";
import Footer from "../common/Footer";
// import ApexChart from "../common/exchange/ApexChart";
import ApexChart from "./ApexChart";
// import ExchangeSwap from "../common/exchange/ExchangeSwap";

export default function Home() {
    return (
        <div>
            <Header />
            <div className="main-container">
                <div className="w-full flex">
                    <ApexChart />
                    {/* <ExchangeSwap /> */}
                </div>
            </div>
            <Footer />
        </div>
    );
}
