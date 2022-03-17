import React, { Component } from 'react';
import { BACKEND_BASE_URL } from '../../../Contants';
import DropdownList from '../../common/DropdownList';
import AccountService from '../../../service/Account';
import PreFileUploadForm from '../../common/PreFileUploadForm';
import PawnShopService from '../../../service/PawnShop';
import { JSEncrypt } from 'jsencrypt'

var rsaCrypt = new JSEncrypt();
var pawnShopService = new PawnShopService();
const accountService = new AccountService();
const UPLOAD_URL = BACKEND_BASE_URL + "/pawnshop/upload";

const UNKNOWN_USER = 0;
const NEW_USER = 1;
const USER_WITH_ACCOUNT = 2;

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

const STATES = {
    "": [
        {
            iconUrl: "",
            title: ""
        }
    ],
    "Australia": [
        {
            iconUrl: "",
            title: "New South Wales", 
        },
        {
            iconUrl: "",
            title: "Queensland", 
        },
        {
            iconUrl: "",
            title: "Northern Territory", 
        },
        {
            iconUrl: "",
            title: "Western Australia", 
        },
        {
            iconUrl: "",
            title: "South Australia", 
        },
        {
            iconUrl: "",
            title: "Victoria", 
        },
        {
            iconUrl: "",
            title: "the Australian Capital Territory", 
        },
        {
            iconUrl: "",
            title: "Tasmania"
        }
    ],
    "China": [
        {
            iconUrl: "",
            title: "Qinghai", 
        },
        {
            iconUrl: "",
            title: "Sichuan", 
        },
        {
            iconUrl: "",
            title: "Gansu", 
        },
        {
            iconUrl: "",
            title: "Heilongjiang", 
        },
        {
            iconUrl: "",
            title: "Yunnan", 
        },
        {
            iconUrl: "",
            title: "Hunan", 
        },
        {
            iconUrl: "",
            title: "Shaanxi", 
        },
        {
            iconUrl: "",
            title: "Hebei", 
        },
        {
            iconUrl: "",
            title: "Jilin", 
        },
        {
            iconUrl: "",
            title: "Hubei", 
        },
        {
            iconUrl: "",
            title: "Guangdong", 
        },
        {
            iconUrl: "",
            title: "Guizhou", 
        },
        {
            iconUrl: "",
            title: "Jiangxi", 
        },
        {
            iconUrl: "",
            title: "Henan", 
        },
        {
            iconUrl: "",
            title: "Shanxi", 
        },
        {
            iconUrl: "",
            title: "Shandong", 
        },
        {
            iconUrl: "",
            title: "Liaoning", 
        },
        {
            iconUrl: "",
            title: "Anhui", 
        },
        {
            iconUrl: "",
            title: "Fujian", 
        },
        {
            iconUrl: "",
            title: "Jiangsu", 
        },
        {
            iconUrl: "",
            title: "Zhejiang", 
        },
        {
            iconUrl: "",
            title: "Taiwan", 
        },
        {
            iconUrl: "",
            title: "Hainan", 
        },
    ]
};

var self = null;

class PawnShopPage extends Component {
    
    state = {
        accounts: null,
        connected_hotwallet: 0,
        error: '',
        inputs: {
            assetName: '',
            assetType: '',
            assetDescription: '',
            assetAddressStreet: '',
            assetAddressCity: '',
            assetAddressState: '',
            assetAddressStreet: '',
            assetAddressZipcode: '',
            assetAddressCountry: '',
            valuationReport: {},
            price: 0,
            pricePercentage: 0,
            quote_price: 0,
            estimatedOcat: 0,
            estimated_fee: '',
        }
    }

    constructor(props) {
        super(props);
        self = this;

        this.valuationReport = null;

        // State Helper
        this.setAssetName = this.setAssetName.bind(this);
        this.setAssetType = this.setAssetType.bind(this);
        this.setAssetDescription = this.setAssetDescription.bind(this);
        this.setStreet = this.setStreet.bind(this);
        this.setCity = this.setCity.bind(this);
        this.setStateName = this.setStateName.bind(this);
        this.setCountry = this.setCountry.bind(this);
        this.setValuationReport = this.setValuationReport.bind(this);
        this.setPrice = this.setPrice.bind(this);
        this.setPricePercentage = this.setPricePercentage.bind(this);
        this.setQuotePrice = this.setQuotePrice.bind(this);
        this.setEstimatedOcat = this.setEstimatedOcat.bind(this);
        this.setEstimatedFee = this.setEstimatedFee.bind(this);
        this.warning = this.warning.bind(this);
        // Event Handler
        this.onChangeAssetType = this.onChangeAssetType.bind(this);
        this.onChangeCountry = this.onChangeCountry.bind(this);
        this.onChangeStateName = this.onChangeStateName.bind(this);

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

    setAssetType = _type => {
        let inputs = this.state.inputs;
        inputs.assetType = _type;
        this.setState({inputs}) 
    }

    setAssetDescription = assetDescription => {
        let inputs = this.state.inputs;
        inputs.assetDescription = assetDescription;
        this.setState({inputs}) 
    }

    setStreet = street => {
        let inputs = this.state.inputs;
        inputs.assetAddressStreet = street;
        this.setState({inputs}) 
    }

    setCity = city => {
        let inputs = this.state.inputs;
        inputs.assetAddressCity = city;
        this.setState({inputs}) 
    }

    setStateName = state_name => {
        let inputs = this.state.inputs;
        inputs.assetAddressState = state_name;
        this.setState({inputs}) 
    }

    setCountry = country => {
        let inputs = this.state.inputs;
        inputs.assetAddressCountry = country;
        this.setState({inputs});
    }

    setPrice = price => {
        let inputs = this.state.inputs;
        inputs.price = price;
        this.setState({inputs}) 
    }

    setValuationReport = valuationReport => {
        let inputs = this.state.inputs;
        inputs.valuationReport = valuationReport;
        this.setState({inputs}) 
    }

    setPricePercentage = pricePercentage => {
        let inputs = this.state.inputs;
        inputs.pricePercentage = pricePercentage;
        this.setState({inputs}) 
    }

    setQuotePrice = quotePrice => {
        let inputs = this.state.inputs;
        inputs.quote_price = quotePrice;
        this.setState({inputs}) 
    }

    setEstimatedOcat = estimatedOcat => {
        let inputs = this.state.inputs;
        inputs.estimatedOcat = estimatedOcat;
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

    onChangeStateName = stateIndex => {
        if (this.state.inputs.assetAddressCountry === "") 
            return;
        this.setStateName(STATES[this.state.inputs.assetAddressCountry][stateIndex].title);
    }

    onSelectValuationReport = fileInfo => {
        this.setValuationReport(fileInfo);
    }

    onClickBooking = ev => {
    }

    onClickSubmit = async ev => {
        try {
            // First upload valuation report
            let ret = await pawnShopService.upload(this.state.inputs.valuationReport);
            if (ret.error - 0 !== 0) {
                alert("Failed to save valuation report: " + ret.data);
                return;
            }
            console.log("Uploading valuation report: ", ret)
            // Then submit to mint a new pawn NFT
            let submitData = this.state.inputs;
            submitData.valuationReport = ret.data;
            ret = await pawnShopService.create({userToken: this.userToken, data: submitData});
            if (ret.error - 0 !== 0) {
                alert("Failed to create new pawn NFT: " + ret.data);
                return;
            }
            alert("Success: " + ret.data);
        } catch(error) {
            alert(error)
        }
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

    async componentDidMount() {
        this.userToken = localStorage.getItem("userToken");
        this.encryptKey = localStorage.getItem("encryptKey");
        this.setEncryptKey(this.encryptKey);

        // Try to connect to my account
        let resp = await accountService.connectAccount({
            userToken: this.userToken
        });
        var errorMsg = null;
        if (resp.error !== undefined) {
            switch (resp.error) {
                case 0:
                    this.setState({ accounts: resp.data.addresses });
                    this.setState({ connected_hotwallet: USER_WITH_ACCOUNT });
                    return;
                case 51:
                case 52:
                    this.setState({ connected_hotwallet: NEW_USER });
                    return;
                case -1000:
                    errorMsg = "No response for get balance";
                    break;
                default:
                    errorMsg = resp.data;
                    break;
            }
        } else {
            errorMsg = "Invalid response for connecting to my account"
        }
        this.warning(errorMsg);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    setEncryptKey(encryptKey) {
        rsaCrypt.setPublicKey(encryptKey);
        this.rsaCryptInited = true;
    }

    warning = (msg) => {
        if (typeof msg === 'object') {
            msg = msg.toString();
        }
        this.setState({ error: msg });
    }

    render() {
        return (
            <div className="my-pawnshop-page main-font main-color font-16 m-8">
                <p className="account-balance-box main-font text-red-400 mb-100 font-16">{this.state.error}</p>
                <p className="main-font font-24 mb-10">Pawn your assets into cryptos</p>

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
                        name="assetAddressStreet"
                        id="assetAddressStreet"
                        placeholder="Asset Address"
                        value={this.state.assetAddressStreet}
                        onChange={this.handleInputChange} autoComplete="off" 
                    />                    
                </div>
                <div>
                    <div className="mt-20">
                        <div className="inline-flex">
                            <div className="w-3/12">
                                {/* <label>City</label> */}
                                <input
                                    type="text"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="assetAddressCity"
                                    id="assetAddressCity"
                                    placeholder="City"
                                    value={this.state.assetAddressCity}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div className="w-3/12">
                                {/* <label>States</label> */}
                                <div>
                                    <DropdownList 
                                        items={STATES[this.state.inputs.assetAddressCountry]}
                                        onSelectItem={this.onChangeStateName} 
                                        placeholder="States"
                                    />
                                </div>
                            </div>
                            <div className="w-3/12">
                                {/* <label>Zip Code</label> */}
                                <input
                                    type="number"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="assetAddressZipcode"
                                    id="assetAddressZipcode"
                                    placeholder="Zip Code"
                                    value={this.state.assetAddressZipcode}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div className="w-3/12">
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
                    <div className="mt-20">
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
                                    name="pricePercentage"
                                    id="pricePercentage"
                                    placeholder="Percentage of value"
                                    value={this.state.pricePercentage}
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
                                    value={this.state.price * this.state.pricePercentage / 100}
                                    onChange={this.handleInputChange} autoComplete="off"
                                />
                            </div>
                            <div>
                                {/* <label>Estimated OCAT</label> */}
                                <input
                                    type="number"
                                    text-align="right"
                                    className="block border border-grey-light bg-gray-100 w-100 p-5 font-16 main-font focus:outline-none rounded "
                                    name="estimatedOcat"
                                    id="estimatedOcat"
                                    placeholder="Estimated OCAT"
                                    value={this.state.estimatedOcat}
                                    onChange={this.handleInputChange} 
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-20">
                        <div>
                            <div className="w-3/12 mr-5">
                                <PreFileUploadForm
                                    title="Upload your valuation report"
                                    onSelectFile={this.onSelectValuationReport}
                                    uploadURL={UPLOAD_URL}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-20">
                        <div className="inline-flex">
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