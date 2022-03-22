import React, { Component } from 'react';
import { BACKEND_BASE_URL } from '../../../Contants';
import DropdownList from '../../common/DropdownList';
import AccountService from '../../../service/Account';
import PreFileUploadForm from '../../common/PreFileUploadForm';
import PawnShopService from '../../../service/PawnShop';
import { JSEncrypt } from 'jsencrypt'
import DelayButton from '../../common/DelayButton';
import Card from '../../common/Card';
import SimpleTable from '../../common/SimpleTable';
import CheckBox from '../../common/CheckBox';

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
        title: "Watches"
    }, 
    {
        iconUrl: null,
        title: "Artworks"
    }, 
    {
        iconUrl: null,
        title: "Gold"
    }, 
    {
        iconUrl: null,
        title: "Solar panel"
    },
];

const ASSET_STATUS_LABELS = [
    "Pending",  // 0
    "Submitted",
    "Declined",
    "Resubmitted",
    "Approved", // 4
    "Minted",
    "Loaned",
    "Burned",   // 7
]

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

const TRACKING_TABLE_SCHEMA = {
    headers: [
        { title: 'Date' },
        { title: 'Asset ID' },
        { title: 'Asset Type' },
        { title: 'Asset Name' },
        { title: 'Quoted Pricce' },
        { title: 'Management Fees' },
        { title: 'Status' },
        { title: 'Action' },
    ]
}

var self = null;

class PawnShopPage extends Component {
    
    state = {
        new_asset_id: "",
        accounts: null,
        connected_hotwallet: 0,
        error_message: '',
        information_message: '',
        inputs: {
            asset_name: '',
            asset_type: '',
            asset_description: '',
            asset_address_street: '',
            asset_address_city: '',
            asset_address_state: '',
            asset_address_zipcode: '',
            asset_address_country: '',
            valuation_report: {},
            price: 0,
            price_percentage: 0,
            quote_price: 0,
            estimated_ocat: 0,
            estimated_fee: '',
        },
        track_table_component: <SimpleTable def={TRACKING_TABLE_SCHEMA} data={[]}></SimpleTable>
    }

    constructor(props) {
        super(props);
        self = this;

        this.valuation_report = null;

        // State Helper
        this.clearAllFields = this.clearAllFields.bind(this);

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
        this.onClickMint = this.onClickMint.bind(this);
        this.onClickBurn = this.onClickBurn.bind(this);
        this.onClickLoan = this.onClickLoan.bind(this);
        this.onClickRestore = this.onClickRestore.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.buildTrackTable = this.buildTrackTable.bind(this);
        this.updateTrackTable = this.updateTrackTable.bind(this);

        this.warning = this.warning.bind(this);
    }

    error = msg => {
        this.setState({error_message: msg});
    }

    inform = msg => {
        this.setState({information_message: msg});
    }

    setAssetName = name => {
        let inputs = this.state.inputs;
        inputs.asset_name = name;
        this.setState({inputs}) 
    }

    setAssetType = _type => {
        let inputs = this.state.inputs;
        inputs.asset_type = _type;
        this.setState({inputs}) 
    }

    setAssetDescription = asset_description => {
        let inputs = this.state.inputs;
        inputs.asset_description = asset_description;
        this.setState({inputs}) 
    }

    setStreet = street => {
        let inputs = this.state.inputs;
        inputs.asset_address_street = street;
        this.setState({inputs}) 
    }

    setCity = city => {
        let inputs = this.state.inputs;
        inputs.asset_address_city = city;
        this.setState({inputs}) 
    }

    setStateName = state_name => {
        let inputs = this.state.inputs;
        inputs.asset_address_state = state_name;
        this.setState({inputs}) 
    }

    setCountry = country => {
        let inputs = this.state.inputs;
        inputs.asset_address_country = country;
        this.setState({inputs});
    }

    setPrice = price => {
        let inputs = this.state.inputs;
        inputs.price = price;
        this.setState({inputs}) 
    }

    setValuationReport = valuation_report => {
        let inputs = this.state.inputs;
        inputs.valuation_report = valuation_report;
        this.setState({inputs}) 
    }

    setPricePercentage = price_percentage => {
        let inputs = this.state.inputs;
        inputs.price_percentage = price_percentage;
        this.setState({inputs}) 
    }

    setQuotePrice = quotePrice => {
        let inputs = this.state.inputs;
        inputs.quote_price = quotePrice;
        this.setState({inputs}) 
    }

    setEstimatedOcat = estimated_ocat => {
        let inputs = this.state.inputs;
        inputs.estimated_ocat = estimated_ocat;
        this.setState({inputs}) 
    }

    setEstimatedFee = estimatedFee => {
        let inputs = this.state.inputs;
        inputs.estimated_fee = estimatedFee;
        this.setState({inputs}) 
    }

    onChangeAssetType = itemIndex => {
        this.setAssetType(ASSET_TYPES[itemIndex].title);
    }

    onChangeCountry = itemIndex => {
        this.setCountry(COUNTRIES[itemIndex].title);
    }

    onChangeStateName = stateIndex => {
        if (this.state.inputs.asset_address_country === "") 
            return;
        this.setStateName(STATES[this.state.inputs.asset_address_country][stateIndex].title);
    }

    clearAllFields = () => {
        this.setState({ 'asset_name': '' });
        this.setState({ 'asset_type': '' });
        this.setState({ 'asset_description': ''});
        this.setState({ 'asset_address_street': ''});
        this.setState({ 'asset_address_city': ''});
        this.setState({ 'asset_address_state': ''});
        this.setState({ 'asset_address_zipcode': ''});
        this.setState({ 'asset_address_country': ''});
        this.setState({ 'valuation_report': ''});
        this.setState({ 'price': 0 });
        this.setState({ 'price_percentage': 0 });
        this.setState({ 'quote_price': 0 });
        this.setState({ 'estimated_ocat': 0 });
        this.setState({ 'estimated_fee': '' });
    }

    onSelectValuationReport = fileInfo => {
        this.setValuationReport(fileInfo);
    }

    onClickBooking = ev => {
    }

    onClickSubmit = async (param, ev, btnCmpnt) => {
        try {
            // First upload valuation report
            let ret = await pawnShopService.upload(this.state.inputs.valuation_report);
            if (ret.error - 0 !== 0) {
                btnCmpnt.stopTimer();
                this.error("Failed to submint: " + ret.data);
                return;
            }
            console.log("Uploading valuation report: ", ret)
            // Then submit to mint a new pawn NFT
            let submitData = this.state.inputs;
            submitData.valuation_report = ret.data;
            ret = await pawnShopService.create({userToken: this.userToken, data: submitData});
            if (ret.error - 0 !== 0) {
                btnCmpnt.stopTimer();
                this.error("Failed to create new pawn NFT: " + ret.data);
                return;
            }

            this.setState({new_asset_id: ret.data.new_id});
            btnCmpnt.stopTimer();
            this.clearAllFields();
            this.buildTrackTable(ret.data.all_assets);
            this.inform("Success: " + ret.data);
        } catch(error) {
            this.error(error)
        }
    }

    onClickDownloadLegalContract = ev => {
    }

    onClickMint = async (params, ev, buttonComponent) => {
        let targetElement = ev.target;
        let assetId = targetElement.id.replace("tracking-item-mint-", "");
        let ret = await pawnShopService.mint({ownerToken: this.userToken, assetId: assetId});
        if (ret.error - 0 !== 0) {
            buttonComponent.stopTimer();
            this.error("Failed to mint: " + ret.data);
            return;
        }
        buttonComponent.stopTimer();
        this.inform("Success to mint: ", ret.data);
        // Get all pawn assets items for this user
        console.log("Get all pawn assets items for the user");
        ret = await pawnShopService.getPawnAssets({userToken: this.userToken});
        if (ret.error - 0 !== 0) {
            this.error("Failed to mint new pawn NFT: " + ret.data);
            return;
        }
        this.buildTrackTable(ret.data.all_assets);
    }

    onClickBurn = async (params, ev, buttonComponent) => {
        let targetElement = ev.target;
        let assetId = targetElement.id.replace("tracking-item-burn-", "");
        let ret = await pawnShopService.burn({ownerToken: this.userToken, assetId: assetId});
        if (ret.error - 0 !== 0) {
            buttonComponent.stopTimer();
            this.error("Failed to burn asset: " + ret.data);
            return;
        }
        buttonComponent.stopTimer();
        this.inform("Success to burn: ", ret.data);
    }

    onClickLoan = async (params, ev, buttonComponent) => {
        let assetId = ev.target.id.replace("tracking-item-loan-", "");
        let ret = await pawnShopService.loan({ownerToken: this.userToken, assetId: assetId});
        buttonComponent.stopTimer();
        if (ret.error - 0 !== 0) {
            this.error("Failed to loan: " + ret.data);
            return;
        }
        this.buildTrackTable(ret.data.all_assets);
    }

    onClickRestore = async (params, ev, buttonComponent) => {
        let assetId = ev.target.id.replace("tracking-item-restore-", "");
        let ret = await pawnShopService.restore({ownerToken: this.userToken, assetId: assetId});
        buttonComponent.stopTimer();
        if (ret.error - 0 !== 0) {
            // btnCmpnt.stopTimer();
            this.error("Failed to return back: " + ret.data);
            return;
        }
        this.buildTrackTable(ret.data.all_assets);
    }

    handleInputChange = ev => {
        let inputs = this.state.inputs;
        inputs[ev.target.name] = ev.target.value;
        this.setState({
          inputs
        });
        if (ev.target.name === 'price_percentage' || ev.target.name === 'price') {
            // this.setState({'quote_price': this.state.price_percentage * this.state.price / 100});
            this.setQuotePrice(this.state.price_percentage * this.state.price / 100);
        }
    }

    buildTrackTable = (assets) => {
        console.log("buildTrackTable(): ", assets);
        let trackTableData = [];
        assets.forEach(record => {
            // "Pending",       // 0
            // "Submitted",     // 1
            // "Declined",      // 2
            // "Resubmitted",   // 3
            // "Approved",      // 4
            // "Minted",        // 5
            // "Loaned",        // 6
            // "Burned",        // 7
            let statusCol = <span>{ASSET_STATUS_LABELS[record.status - 0]}</span>;
            let actionCol = <span></span>;
            switch (record.status) {
            case 2:
                actionCol = <DelayButton
                    id={"tracking-item-resubmit-" + record.id} 
                    captionInDelay="Resubmit"
                    caption="Resubmit"
                    maxDelayInterval={30}
                    onClickButton={this.onClickSubmit}
                    onClickButtonParam={null} 
                />
                break;
            case 3:
                actionCol = <span>Resubmitted</span>;
                break;
            case 4: // Once verified, can mint or burn
                actionCol = <div>
                                <DelayButton
                                    id={"tracking-item-mint-" + record.id} 
                                    captionInDelay="Minting"
                                    caption="Mint"
                                    maxDelayInterval={30}
                                    onClickButton={this.onClickMint}
                                    onClickButtonParam={null} 
                                />
                                <DelayButton
                                    id={"tracking-item-burn-" + record.id} 
                                    captionInDelay="Burning"
                                    caption="Burn"
                                    maxDelayInterval={30}
                                    onClickButton={this.onClickBurn}
                                    onClickButtonParam={null} 
                                />
                            </div>
                break;
            case 5:// Once minted, can swap into OCAT
                actionCol = <DelayButton 
                                id={"tracking-item-loan-" + record.id} 
                                captionInDelay="Loaning"
                                caption="Loan"
                                className="px-4 py-1 text-white bg-blue-400 rounded cursor-pointer" 
                                onClickButton={this.onClickLoan} 
                                maxDelayInterval={30}
                                onClickButtonParam={null} 
                            />
                break;
            case 6:
                actionCol = <DelayButton
                                id={"tracking-item-restore-" + record.id} 
                                captionInDelay="Restoring"
                                caption="Restore"
                                className="px-4 py-1 text-white bg-blue-400 rounded cursor-pointer" 
                                onClickButton={this.onClickRestore}
                                maxDelayInterval={30}
                                onClickButtonParam={null} 
                            />
                break;
            default:
                break;
            }

            let row = {
                id: record.id,
                data: [
                    { value: new Date(record.created_at).toLocaleString() },
                    { value: record.id },
                    { value: record.asset_type },
                    { value: record.asset_name },
                    { value: record.quote_price },
                    { value: record.estimated_fee },
                    { value: statusCol },
                    { value: actionCol },
                ]
            };
            trackTableData.push(row);
        });
        this.setState({
            track_table_component: <SimpleTable 
                                        def={TRACKING_TABLE_SCHEMA} 
                                        data={trackTableData}>
                                    </SimpleTable>
        });
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
                    break;
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
        // Get all pawn assets items for this user
        console.log("Get all pawn assets items for the user");
        // this.trackTableUpdateTimer = setInterval(this.updateTrackTable, 60000);
        this.updateTrackTable();
    }

    async updateTrackTable() {
        let ret = await pawnShopService.getPawnAssets({userToken: this.userToken});
        if (ret.error - 0 !== 0) {
            this.error("Failed to update track table: " + ret.data);
            return;
        }
        this.buildTrackTable(ret.data);
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
        if (!msg) {
            return;
        }
        if (typeof msg === 'object') {
            msg = msg.toString();
        }
        this.setState({ error: msg });
    }

    render() {
        return (
            <div>
                <div className="my-pawnshop-page main-font main-color font-16 m-8">
                    <p className="account-balance-box main-font text-red-400 mb-100 font-16">{this.state.error_message}</p>
                    <p className="account-balance-box main-font text-green-400 mb-100 font-16">{this.state.information_message}</p>
                    <Card title='Pawn your assets into cryptos'>
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
                                        value={this.state.asset_name}
                                        onChange={this.handleInputChange} autoComplete="off" 
                                    />                    
                                </div>
                            </div>
                        </div>
                        <div className="mt-20">
                            <div className="inline-flex w-full">
                                <div className="w-4/12">
                                    <input
                                        type="text"
                                        className="inline-flex border border-grey-light bg-gray-100 w-full mt-5 p-5 font-16 main-font focus:outline-none rounded "
                                        name="asset_description"
                                        id="asset_description"
                                        placeholder="Asset Description"
                                        value={this.state.asset_description}
                                        onChange={this.handleInputChange} autoComplete="off" 
                                    />                    
                                </div>
                                <div className="w-4/12">
                                    <input
                                        type="text"
                                        className="inline-flex block border border-grey-light bg-gray-100 w-full mt-5 p-5 font-16 main-font focus:outline-none rounded "
                                        name="asset_address_street"
                                        id="asset_address_street"
                                        placeholder="Asset Address"
                                        value={this.state.asset_address_street}
                                        onChange={this.handleInputChange} autoComplete="off" 
                                    />
                                </div>
                                <div className="w-4/12">
                                    {/* <label>City</label> */}
                                    <input
                                        type="text"
                                        className="block border border-grey-light bg-gray-100 w-100 mt-5 p-5 font-16 main-font focus:outline-none rounded "
                                        name="asset_address_city"
                                        id="asset_address_city"
                                        placeholder="City"
                                        value={this.state.asset_address_city}
                                        onChange={this.handleInputChange} autoComplete="off"
                                    />
                                </div>                    
                            </div>
                        </div>
                        <div>
                            <div className="mt-20">
                                <div className="inline-flex w-full">
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
                                    <div className="w-3/12">
                                        {/* <label>States</label> */}
                                        <div>
                                            <DropdownList 
                                                items={STATES[this.state.inputs.asset_address_country]}
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
                                            name="asset_address_zipcode"
                                            id="asset_address_zipcode"
                                            placeholder="Zip Code"
                                            value={this.state.asset_address_zipcode}
                                            onChange={this.handleInputChange} autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-20">
                                <div className="inline-flex w-full">
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
                            <div className="mt-20">
                                <div className="inline-flex w-full">
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
                                <div className="inline-flex w-full">
                                    <div className="w-4/12 mr-5">
                                        <label>You don't have a valuation report book a valuation time and date</label>
                                        <button
                                            className="block border border-grey-light button-bg p-5 hover-transition main-font focus:outline-none rounded text-white verify-button"
                                            onClick={this.onClickBooking}
                                        >Booking me</button>
                                    </div>
                                    <div className="w-4/12 mr-5">
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
                            <div className="mt-10 flex justify-end	">
                                {/* <button
                                    className="border border-grey-light button-bg p-5 hover-transition main-font focus:outline-none rounded text-white verify-button"
                                    onClick={this.onClickSubmit}
                                >Submit</button> */}
                                <DelayButton
                                    captionInDelay="Submitting"
                                    caption="Submit"
                                    maxDelayInterval={30}
                                    onClickButton={this.onClickSubmit}
                                    onClickButtonParam={null} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="my-pawnshop-page main-font main-color font-16 m-8 mt-16">
                    <Card title='Tracking'>
                        {this.state.track_table_component}
                    </Card>
                </div>
            </div>
        );
    }

}

export default PawnShopPage;