import mainImg from '../assets/images/img/main-img.png';

export default function Earn() {
    return (
        <div className="main-introduction py-20">
            <div className="small-container flex items-center responsive-col">
                <div className="introduction-right w-1/2 pr-40 responsive-p-30 ">
                    <img src={mainImg} alt="main-img" className="rounded-full"></img>
                </div>
                <div className="introduction-left w-1/2 responsive-w-90">
                    <h1 className="intro-title main-color font-40 main-font  capitalize">Earn passive income with crypto.</h1>
                    <p className="intro-description main-color font-24 main-font py-16 main-lineheight">
                        We are going to introduce our asset conversion and LP staking rates.
                    </p>
                    <div className="intro-bnt_group">
                        <button className="hover-transition button-bg blue-border text-white blue-border main-btn">Explore</button>
                        <button className="hover-transition main-color-blue main-btn">Learn</button>
                    </div>
                </div>
            </div>
            <div className="earn-statistic small-container py-20">
                <div className="earn-statistic-title main-color font-24 main-font pb-10">
                    Top <span className="main-color-blue"> Farms </span>
                </div>
                <div className="flex justify-between">
                    <div className="coin-kind border-r-2 border-gray-400 w-1/5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            BICOIN-BUSD
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            APR
                        </p>
                    </div>
                    <div className="coin-kind border-r-2 border-gray-400 w-1/5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            BICOIN-BUSD
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            APR
                        </p>
                    </div>
                    <div className="coin-kind border-r-2 border-gray-400 w-1/5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            BICOIN-BUSD
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            APR
                        </p>
                    </div>
                    <div className="coin-kind border-r-2 border-gray-400 w-1/5">
                        <p className="coin-kind_title font-18 main-font main-color">
                            BICOIN-BUSD
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            APR
                        </p>
                    </div>
                    <div className="coin-kind">
                        <p className="coin-kind_title font-18 main-font main-color">
                            BICOIN-BUSD
                        </p>
                        <p className="coin-percent font-18 main-font main-color-blue">
                            xxx.xxx%
                        </p>
                        <p className="coin-APR font-16 main-font main-color">
                            APR
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}
