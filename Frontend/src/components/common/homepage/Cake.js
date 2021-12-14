import mainImg from '../assets/images/img/main-img.png';

export default function Cake() {
    return (
        <div className="main-introduction py-20">
            <div className="small-container flex items-center responsive-col">
                <div className="introduction-left w-1/2 responsive-flex-order1 responsive-w-90">
                    <h1 className="intro-title main-color font-40 main-font capitalize">A Anchor point to Australian Dollar.</h1>
                    <p className="intro-description main-color font-24 main-font py-16 main-lineheight">
                        We are going to introduce our stable coin OCX.
                    </p>
                    <div className="intro-bnt_group">
                        <button className="hover-transition button-bg text-white blue-border main-btn">Explore</button>
                        <button className="hover-transition main-color-blue main-btn">Learn</button>
                    </div>
                </div>
                <div className="introduction-right w-1/2 pl-40 responsive-p-30">
                    <img src={mainImg} alt="main-img" className="rounded-full"></img>
                </div>
            </div>
            <div className="earn-statistic small-container py-20">
                <div className="flex justify-between">
                    <div className="coin-kind border-r-2 border-gray-400 w-1/4 mr-5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            ETH - OCX
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            EXCDANGE RATE
                        </p>
                    </div>
                    <div className="coin-kind border-r-2 border-gray-400 w-1/4 mr-5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            BITCOIN - OCX
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            EXCDANGE RATE
                        </p>
                    </div>
                    <div className="coin-kind border-r-2 border-gray-400 w-1/4 mr-5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            OCX - DAI
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            EXCDANGE RATE
                        </p>
                    </div>
                    <div className="coin-kind w-1/4 mr-5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            USDC-OCX
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            EXCDANGE RATE
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}
