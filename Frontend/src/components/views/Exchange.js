import Header from "../common/Header";
import Footer from "../common/Footer";
import ExchangeChart from "../common/exchange/ExchangeChart";
import ExchangeSwap from "../common/exchange/ExchangeSwap";

export default function Home() {
    return (
        <div>
            <Header />
            <div className="main-container">
                <div className="w-full flex">
                    <ExchangeChart />
                    <ExchangeSwap />
                </div>
            </div>
            <Footer />
        </div>
    );
}
