import React, { Component } from 'react';
import { BACKEND_BASE_URL } from '../../../Contants';
import DropdownList from '../../common/DropdownList';
import Button from "@material-tailwind/react/Button";
import PreFileUploadForm from '../../common/PreFileUploadForm';

const UPLOAD_URL = BACKEND_BASE_URL + "/pawnshop/upload";

const ASSET_TYPES = [
    {
        iconUrl: null,
        title: "Wines"
    }, 
    {
        iconUrl: null,
        title: "Watches"
    }, 
    {
        iconUrl: null,
        title: "Equipments"
    }, 
    {
        iconUrl: null,
        title: "------------"
    }, 
    {
        iconUrl: null,
        title: "Warehousing"
    },
];

const COUNTRIES = [
    {
        iconUrl: "/images/country-flags/Australia.png",
        title: "Australia"
    },
    {
        iconUrl: "/images/country-flags/China.png",
        title: "China"
    }, 
];

class PawnShopPage extends Component {
    
    state = {
        inputs: {
            assetName: '',
            assetDescription: '',
            assetAddress: '',
            city: '',
            street: '',
            zipcode: '',
            country: '',
            price: 0,
            price_percentage: 0,
            quote_price: 0,
            estimated_ocat: 0,
            estimated_fee: '',
        }
    }

    constructor(props) {
        super(props);

        this.valuationInfo = null;

        // State Helper
        this.setAssetName = this.setAssetName.bind(this);
        this.setAssetDescription = this.setAssetDescription.bind(this);
        this.setAssetAddress = this.setAssetAddress.bind(this);
        this.setCity = this.setCity.bind(this);
        this.setCountry = this.setCountry.bind(this);
        this.setPrice = this.setPrice.bind(this);
        this.setPricePercentage = this.setPricePercentage.bind(this);
        this.setQuotePrice = this.setQuotePrice.bind(this);
        this.setEstimatedOcat = this.setEstimatedOcat.bind(this);
        this.setEstimatedFee = this.setEstimatedFee.bind(this);
        // Event Handler
        this.onChangeAssetType = this.onChangeAssetType.bind(this);
        this.onChangeCountry = this.onChangeCountry.bind(this);
        this.onClickBooking = this.onClickBooking.bind(this);
        this.onClickSubmit = this.onClickSubmit.bind(this);
        this.onSelectValuationReport = this.onSelectValuationReport.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    setAssetName = name => {
        let inputs = this.state.inputs;
        inputs.assetName = name;
        this.setState({inputs}) 
    }

    setAssetDescription = assetDescription => {
        let inputs = this.state.inputs;
        inputs.assetDescription = assetDescription;
        this.setState({inputs}) 
    }

    setAssetAddress = assetAddress => {
        let inputs = this.state.inputs;
        inputs.assetAddress = assetAddress;
        this.setState({inputs}) 
    }

    setCity = city => {
        let inputs = this.state.inputs;
        inputs.city = city;
        this.setState({inputs}) 
    }

    setCountry = country => {
        let inputs = this.state.inputs;
        inputs.country = country;
        this.setState({inputs}) 
    }

    setPrice = price => {
        let inputs = this.state.inputs;
        inputs.price = price;
        this.setState({inputs}) 
    }

    setPricePercentage = pricePercentage => {
        let inputs = this.state.inputs;
        inputs.price_percentage = pricePercentage;
        this.setState({inputs}) 
    }

    setQuotePrice = quotePrice => {
        let inputs = this.state.inputs;
        inputs.quote_price = quotePrice;
        this.setState({inputs}) 
    }

    setEstimatedOcat = estimatedOcat => {
        let inputs = this.state.inputs;
        inputs.estimated_ocat = estimatedOcat;
        this.setState({inputs}) 
    }

    setEstimatedFee = estimatedFee => {
        let inputs = this.state.inputs;
        inputs.estimated_fee = estimatedFee;
        this.setState({inputs}) 
    }

    onChangeAssetType = itemIndex => {
        console.log("onChangeAssetType(): ", itemIndex);
    }

    onChangeCountry = itemIndex => {
        this.setCountry(COUNTRIES[itemIndex].title);
    }

    onSelectValuationReport = fileInfo => {
        this.valuationInfo = fileInfo;
    }

    onClickBooking = ev => {
    }

    onClickSubmit = ev => {

    }


    onClickDownloadLegalContract = ev => {
    }

    handleInputChange = ev => {
        let inputs = this.state.inputs;
        inputs[ev.target.name] = ev.target.value;
        this.setState({
          inputs
        });
        if (ev.target.name === 'asset_name') {
        }    
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <div className="my-pawnshop-page main-font main-color font-16 m-8">
                <p className="mb-10">Pawn your assets into cryptos</p>
                <div>
                    <div className="inline-flex w-full">
                        <div className="w-4/12" text-align="right">
                            {/* <p className="block">Asset Type:</p> */}
                            <DropdownList 
                                items={ASSET_TYPES} 
                                onSelectItem={this.onChangeAssetType} 
                                placeholder="Asset Type"
                            />
                        </div>
                        <div className="w-4/12">
                            <input
                                type="text"
                                className="inline-flex block border border-grey-light ml-10 bg-gray-100 w-200 p-5 font-16 main-font focus:outline-none rounded "
                                name="asset_name"
                                id="asset_name"
                                placeholder="Asset Name"
                                value={this.state.assetName}
                                onChange={this.handleInputChange} autoComplete="off" 
                            />                    
                        </div>
                    </div>
                </div>
                <div>
                    <input
                        type="text"
                        className="inline-flex border border-grey-light bg-gray-100 w-full mt-5 p-5 font-16 main-font focus:outline-none rounded "
                        name="asset_desc"
                        id="asset_desc"
                        placeholder="Asset Description"
                        value={this.state.assetDescription}
                        onChange={this.handleInputChange} autoComplete="off" 
                    />                    
                </div>
                <div>
                    <input
                        type="text"
                        className="inline-flex block border border-grey-light bg-gray-100 w-full mt-5 p-5 font-16 main-font focus:outline-none rounded "
                        name="asset_address"
                        id="asset_address"
                        placeholder="Asset Address"
                        value={this.state.assetAddress}
                        onChange={this.handleInputChange} autoComplete="off" 
                    />                    
                </div>
                <div>
                    <div>
                        <div className="inline-flex mt-5">
                            <div>
                                {/* <label>City</label> */}
                                <input
                                    type="text"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="city"
                                    id="city"
                                    placeholder="City"
                                    value={this.state.city}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div>
                                {/* <label>Zip Code</label> */}
                                <input
                                    type="number"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="zipcode"
                                    id="zipcode"
                                    placeholder="Zip Code"
                                    value={this.state.zipcode}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div>
                                {/* <label>Country</label> */}
                                <div>
                                    <DropdownList 
                                        items={COUNTRIES} 
                                        onSelectItem={this.onChangeCountry} 
                                        placeholder="Country"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10">
                        <div className="inline-flex">
                            <div>
                                {/* <label>Valuation Price</label> */}
                                <input
                                    type="number"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="price"
                                    id="price"
                                    placeholder="Valuation Price"
                                    value={this.state.price}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div>
                                {/* <label>Percentage of value</label> */}
                                <input
                                    type="number"
                                    text-align="right"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="price_percentage"
                                    id="price_percentage"
                                    placeholder="Percentage of value"
                                    value={this.state.price_percentage}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div>
                                {/* <label>Quote Price</label> */}
                                <input
                                    type="number"
                                    text-align="right"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="quote_price"
                                    id="quote_price"
                                    placeholder="Quote Price"
                                    value={this.state.quote_price}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div>
                                {/* <label>Estimated OCAT</label> */}
                                <input
                                    type="number"
                                    text-align="right"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="estimated_ocat"
                                    id="estimated_ocat"
                                    placeholder="Estimated OCAT"
                                    value={this.state.estimated_ocat}
                                    onChange={this.handleInputChange} 
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-10">
                        <div className="inline-flex">
                            <div className="w-3/12 mr-5">
                                <PreFileUploadForm
                                    title="Upload your valuation report"
                                    onSelectFile={this.onSelectValuationReport}
                                    uploadURL={UPLOAD_URL}
                                />
                            </div>
                            <div className="w-3/12 mr-5">
                                <label>You don't have a valuation report book a valuation time and date</label>
                                <button
                                    className="block border border-grey-light button-bg p-5 hover-transition main-font focus:outline-none rounded text-white verify-button"
                                    onClick={this.onClickBooking}
                                >Booking me</button>
                            </div>
                            <div className="w-2/12 mr-5">
                                <label>Estimated Fee</label>
                                <input
                                    type="number"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="estimated_fee"
                                    id="estimated_fee"
                                    placeholder="Estimated Fee"
                                    value={this.state.estimated_fee}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div className="w-4/12 mr-5">
                                <a href="#" className="px-4 py-1  text-blue-500 bg-blue-200 rounded-lg">Click here to download legal contract</a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10" text-align="right">
                        <button
                            className="border border-grey-light button-bg p-5 hover-transition main-font focus:outline-none rounded text-white verify-button"
                            onClick={this.onClickSubmit}
                        >Submit</button>
                    </div>
                </div>

            </div>
        );
    }

}

export default PawnShopPage;