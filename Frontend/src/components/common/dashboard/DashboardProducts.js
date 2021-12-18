import React from "react";
import productImg from '../assets/images/img/product.jpeg';


export default class DashboardProducts extends React.Component {

    render() {
        return (
            <div id="dashboard-table-content ">
                <div class="">
                    <p className="table-title font-16 main-font ">
                        Products List
                    </p>
                    <div className="product-item-content px-10">
                        <img src={productImg} alt="main-logo" className="product-img w-full" />
                        <img src={productImg} alt="main-logo" className="product-img w-full" />
                        <img src={productImg} alt="main-logo" className="product-img w-full" />
                        <img src={productImg} alt="main-logo" className="product-img w-full" />
                        <img src={productImg} alt="main-logo" className="product-img w-full" />
                    </div>
                </div>
            </div>
        );
    }
}

