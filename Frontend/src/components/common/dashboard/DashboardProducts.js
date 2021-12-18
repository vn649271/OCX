import React from "react";
// import productImg from '../assets/images/img/product.jpeg';


export default class DashboardProducts extends React.Component {

    render() {
        return (
            <div id="dashboard-table-content ">
                <div class="">
                    <p className="table-title font-16 main-font main-bold mb-5">
                        Products List
                    </p>
                    <div className="product-item-content px-10">
                        <div className="product-card w-full dashboard-table mb-5">
                            <div className="product-card-header  border-4 border-white relative flex justify-between w-full">
                                <div className="card-sell-part p-5">
                                    <p className="main-font font-20 main-color mb-5">
                                        <i class="fa fa-moon-o" aria-hidden="true"></i>
                                    </p>
                                    <p className="main-font font-20 main-color product-sell-price">
                                        1.2345
                                    </p>
                                </div>
                                <div className="card-buy-part p-5">
                                    <p className="main-font font-20 main-color mb-5">
                                        <i class="fa fa-moon-o" aria-hidden="true"></i>
                                    </p>
                                    <p className="main-font font-20 main-color product-sell-price">
                                        1.2545
                                    </p>
                                </div>
                                <div className="product-middle-line border-l-4 border-white h-full absolute">

                                </div>
                                <div className="product-symbol absolute">
                                    <p className="font-20 main-font main-color my-2 text-center">EURUSD</p>
                                    <div className="trading-price py-6 px-16  bg-white main-color main-font font-20">
                                        1.9
                                    </div>
                                </div>
                            </div>
                            <div className="product-card-footer flex justify-between p-5">
                                <p className="main-font font-20 main-color product-sell-price">
                                    L : 1.2355
                                </p>
                                <p className="main-font font-20 main-color product-sell-price">
                                    H : 1.2375
                                </p>
                            </div>
                        </div>
                        <div className="product-card w-full dashboard-table mb-5">
                            <div className="product-card-header  border-4 border-white relative flex justify-between w-full">
                                <div className="card-sell-part p-5">
                                    <p className="main-font font-20 main-color mb-5">
                                        <i class="fa fa-moon-o" aria-hidden="true"></i>
                                    </p>
                                    <p className="main-font font-20 main-color product-sell-price">
                                        1.2345
                                    </p>
                                </div>
                                <div className="card-buy-part p-5">
                                    <p className="main-font font-20 main-color mb-5">
                                        <i class="fa fa-moon-o" aria-hidden="true"></i>
                                    </p>
                                    <p className="main-font font-20 main-color product-sell-price">
                                        1.2545
                                    </p>
                                </div>
                                <div className="product-middle-line border-l-4 border-white h-full absolute">

                                </div>
                                <div className="product-symbol absolute">
                                    <p className="font-20 main-font main-color my-2 text-center">EURUSD</p>
                                    <div className="trading-price py-6 px-16  bg-white main-color main-font font-20">
                                        1.9
                                    </div>
                                </div>
                            </div>
                            <div className="product-card-footer flex justify-between p-5">
                                <p className="main-font font-20 main-color product-sell-price">
                                    L : 1.2355
                                </p>
                                <p className="main-font font-20 main-color product-sell-price">
                                    H : 1.2375
                                </p>
                            </div>
                        </div>
                        <div className="product-card w-full dashboard-table mb-5">
                            <div className="product-card-header  border-4 border-white relative flex justify-between w-full">
                                <div className="card-sell-part p-5">
                                    <p className="main-font font-20 main-color mb-5">
                                        <i class="fa fa-moon-o" aria-hidden="true"></i>
                                    </p>
                                    <p className="main-font font-20 main-color product-sell-price">
                                        1.2345
                                    </p>
                                </div>
                                <div className="card-buy-part p-5">
                                    <p className="main-font font-20 main-color mb-5">
                                        <i class="fa fa-moon-o" aria-hidden="true"></i>
                                    </p>
                                    <p className="main-font font-20 main-color product-sell-price">
                                        1.2545
                                    </p>
                                </div>
                                <div className="product-middle-line border-l-4 border-white h-full absolute">

                                </div>
                                <div className="product-symbol absolute">
                                    <p className="font-20 main-font main-color my-2 text-center">EURUSD</p>
                                    <div className="trading-price py-6 px-16  bg-white main-color main-font font-20">
                                        1.9
                                    </div>
                                </div>
                            </div>
                            <div className="product-card-footer flex justify-between p-5">
                                <p className="main-font font-20 main-color product-sell-price">
                                    L : 1.2355
                                </p>
                                <p className="main-font font-20 main-color product-sell-price">
                                    H : 1.2375
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

