import React, { Component } from 'react';
import { BACKEND_BASE_URL } from '../../../Contants';
import DropdownList from '../../common/DropdownList';
import OcxDropdownControlList from '../../common/OcxDropdownControlList';
import AccountService from '../../../service/Account';
import PreFileUploadForm from '../../common/PreFileUploadForm';
import PawnShopService from '../../../service/PawnShop';
import PriceOracleService from '../../../service/PriceOracle';
import { JSEncrypt } from 'jsencrypt'
import DelayButton from '../../common/DelayButton';
import OcxCard from '../../common/OcxCard';
import OcxInput from '../../common/OcxInput';
import OcxModal from '../../common/OcxModal';
import OcxSimpleTable from '../../common/OcxSimpleTable';
import OcxSpinButton from '../../common/OcxSpinButton';
import OcxPageSpinner from '../../common/OcxPageSpinner';
import OcxConfirm from '../../common/OcxConfirm';
import OcxBasicButton from '../../common/OcxBasicButton';
import "abortcontroller-polyfill";

var rsaCrypt = new JSEncrypt();
var pawnShopService = new PawnShopService();
var priceOracleService = new PriceOracleService();
const accountService = new AccountService();
const UPLOAD_URL = BACKEND_BASE_URL + "/pawnshop/upload";

const UNKNOWN_USER = 0;
const NEW_USER = 1;
const USER_WITH_ACCOUNT = 2;

const PRICE_MONITOR_INTERVAL = 300000; // every 5 minutes

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
        { title: 'Date', field_name: 'created_at' },
        { title: 'Asset ID', field_name: 'id' },
        { title: 'Asset Type', field_name: 'asset_type' },
        { title: 'Asset Name', field_name: 'asset_name' },
        { title: 'Estimated OCAT', field_name: 'estimated_ocat' },
        { title: 'Management Fees', field_name: 'estimated_fee' },
        { title: 'Status', field_name: 'status' },
        { title: 'Action', name: '' },
    ]
}

const   SUBMIT = 1, 
        MINT = 2, 
        BURN = 3, 
        LOAN = 4,
        RESTORE = 5;

var self = null;

class PawnShopPage extends Component {
    
    state = {
        new_asset_info: "",
        accounts: null,
        connected_hotwallet: 0,
        message: '',
        message_type: 'account-balance-box main-font text-green-400 mb-100 font-16',
        message_box: <></>,
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
            reported_price: '',
            convert_ratio: '',
        },
		quoted_price: '',
        estimated_ocat: '',
		// estimated_fee: '',
        application_fee: '',
        valuation_fee: '',
        weekly_fee: '',
        show_confirm: false,
        show_submit_success_modal: false,
        show_mint_confirm: false,
        show_loan_confirm: false,
        show_restore_confirm: false,
        confirm_handler: null,
        confirm_text: "",
        submit_success_info: null,
        show_burn_confirm: false,
        track_table_data: null,
        prices: null,
        pageSpin: true,
    }

    constructor(props) {
        super(props);
        self = this;

        const AbortController = window.AbortController;
        this.controller = new AbortController();
        this.signal = this.controller.signal;

        this.valuation_report = null;
        this.priceMonitorTimer = null;
        this.confirmContext = null;
        this.estimatedFee = 0;

        // State Helper
        this.clearAllFields = this.clearAllFields.bind(this);
		this.startPriceMonitor = this.startPriceMonitor.bind(this);
		this.priceMonitor = this.priceMonitor.bind(this);
        this.setAssetName = this.setAssetName.bind(this);
        this.setAssetType = this.setAssetType.bind(this);
        this.setAssetDescription = this.setAssetDescription.bind(this);
        this.setStreet = this.setStreet.bind(this);
        this.setCity = this.setCity.bind(this);
        this.setStateName = this.setStateName.bind(this);
        this.setCountry = this.setCountry.bind(this);
        this.setValuationReport = this.setValuationReport.bind(this);
        this.setPrice = this.setPrice.bind(this);
        this.setConvertRatio = this.setConvertRatio.bind(this);
        this.setQuotedPrice = this.setQuotedPrice.bind(this);
        this.setEstimatedOcat = this.setEstimatedOcat.bind(this);
        this.setSubmitFee = this.setSubmitFee.bind(this);
        this.setWeeklyFee = this.setWeeklyFee.bind(this);
        this.loadWeeklyFee = this.loadWeeklyFee.bind(this);

        // Event Handler
        this.onChangeAssetType = this.onChangeAssetType.bind(this);
        this.onChangeCountry = this.onChangeCountry.bind(this);
        this.onChangeStateName = this.onChangeStateName.bind(this);

        this.onClickBooking = this.onClickBooking.bind(this);
        this.onClickSubmit = this.onClickSubmit.bind(this);
        this.onClickToAsset = this.onClickToAsset.bind(this);
        this.onClickSubmitConfirm = this.onClickSubmitConfirm.bind(this);
        this.onClickResubmit = this.onClickResubmit.bind(this);
        this.onSelectValuationReport = this.onSelectValuationReport.bind(this);
        this.onClickMint = this.onClickMint.bind(this);
        this.onClickMintConfirm = this.onClickMintConfirm.bind(this);
        this.onClickBurn = this.onClickBurn.bind(this);
        this.onClickLoan = this.onClickLoan.bind(this);
        this.onClickLoanConfirm = this.onClickLoanConfirm.bind(this);
        this.onClickRestore = this.onClickRestore.bind(this);
        this.onClickRestoreConfirm = this.onClickRestoreConfirm.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.buildTrackTable = this.buildTrackTable.bind(this);
        this.updateTrackTable = this.updateTrackTable.bind(this);
        this.setPrices = this.setPrices.bind(this);
        this.showNewSubmit = this.showNewSubmit.bind(this);
        this.showConfirm = this.showConfirm.bind(this);
        this.closeConfirm = this.closeConfirm.bind(this);

        this.showMessageBox = this.showMessageBox.bind(this);
    }

    async componentDidMount() {
        this.setState({pageSpin: true});
        this.userToken = localStorage.getItem("userToken");
        this.encryptKey = localStorage.getItem("encryptKey");
        this.setEncryptKey(this.encryptKey);

        // Try to connect to my account
        let resp = await accountService.connectAccount({
            userToken: this.userToken
        });
        this.setState({pageSpin: false});
        var errorMsg = null;
        if (resp.error !== undefined) {
            switch (resp.error) {
            case 0:
                this.setState({ accounts: resp.data.addresses });
                this.setState({ connected_hotwallet: USER_WITH_ACCOUNT });
                this.startPriceMonitor();
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
        if (errorMsg) {
            this.showMessageBox(errorMsg.toString(), 1);
			return;
        }
        // Get all pawn assets items for this user
        this.updateTrackTable();
    }

    componentWillUnmount = () => {
        this.controller.abort();
        if (this.priceMonitorTimer) {
            clearInterval(this.priceMonitorTimer);
            this.priceMonitorTimer = null;
        }
    }

    startPriceMonitor = () => {
        this.priceMonitorTimer = setInterval(this.priceMonitor, PRICE_MONITOR_INTERVAL);
		this.priceMonitor();
    }
    priceMonitor = async () => {
        // Load submition fee
        pawnShopService.getSubmitFee({
            userToken: this.userToken
        }).then(ret => {
            if (ret.error != undefined && ret.error == 0) {
                self.setSubmitFee(ret.data);
            }
        });
        // Load weekly fee
        this.loadWeeklyFee();
        // Get PNFT mint fee        
        pawnShopService.getPnftFee({
            userToken: this.userToken
        }).then(ret => {
            if (ret.error != undefined && ret.error == 0) {
                self.estimatedFee = ret.data.mint;
            }
        });
        // Load prices of ETH, OCAT and other tokens
        priceOracleService.getPrices({
            userToken: this.userToken
        }).then(ret => {
            if (ret.error != undefined && ret.error == 0) {
                self.setPrices(ret.data);
            }
        });
    }
    loadWeeklyFee = async (basePrice) => {
        pawnShopService.getWeeklyFee({
            userToken: this.userToken,
            basePrice: basePrice ? basePrice : 0
        }).then(ret => {
            if (ret.error != undefined && ret.error == 0) {
                self.setWeeklyFee(ret.data);
            }
        });
    }
    showConfirm = params => {
        switch (params.id) {
        case SUBMIT:
            this.setState({confirm_handler: this.onClickSubmitConfirm});
            this.setState({confirm_text: 'Are you sure to submit?'});
            break;
        case MINT:
            this.setState({confirm_handler: this.onClickMintConfirm});
            this.setState({confirm_text: 'Are you sure to mint?'});
            break;
        case BURN:
            this.setState({confirm_handler: this.onClickBurnConfirm});
            this.setState({confirm_text: 'Are you sure to burn?'});
            break;
        case LOAN:
            this.setState({confirm_handler: this.onClickLoanConfirm});
            this.setState({confirm_text: 'Are you sure to loan?'});
            break;
        case RESTORE:
            this.setState({confirm_handler: this.onClickRestoreConfirm});
            this.setState({confirm_text: 'Are you sure to restore?'});
            break;
        }
        this.confirmContext = params.context ? params.context : null;
        this.setState({show_confirm: true});
    }
    closeConfirm = () => {
        this.setState({show_confirm: false});
        return this.confirmContext;
    }
    showNewSubmit = newSubmitInfo => {
        if (newSubmitInfo == undefined || !newSubmitInfo) {
            this.showMessageBox("Failed to show new submitted information");
            return;
        }
        var newSubmitInfoCmp = <div>
            <p>Name: { newSubmitInfo.asset_name }</p>
            <p>Type: { newSubmitInfo.asset_type }</p>
            <p>Description: { newSubmitInfo.asset_description }</p>
            <p>Country: { newSubmitInfo.asset_address_country }</p>
            <p>City: { newSubmitInfo.asset_address_city }</p>
            <p>Street: { newSubmitInfo.asset_address_street }</p>
            <p>Zip Code: { newSubmitInfo.asset_address_zipcode }</p>
            <p>Reported Price: ${newSubmitInfo.reported_price}</p>
            <p>Asset-Token convert ratio: { newSubmitInfo.convert_ratio }%</p>
            <p>Estimated OCAT: { newSubmitInfo.estimated_ocat }</p>
            <p>Estimated Fee: ${newSubmitInfo.estimated_fee}</p>
            <p>Created At: { newSubmitInfo.created_at }</p>
        </div>;
        this.setState({submit_success_info: newSubmitInfoCmp});
    }

    setPrices = prices => {
        self.setState({prices: prices});
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
        inputs.reported_price = price;
        this.setState({inputs}) 
    }

    setValuationReport = valuation_report => {
        let inputs = this.state.inputs;
        inputs.valuation_report = valuation_report;
        this.setState({inputs}) 
    }

    setConvertRatio = convert_ratio => {
        let inputs = this.state.inputs;
        inputs.convert_ratio = convert_ratio;
        this.setState({inputs}) 
    }
    setQuotedPrice = quotePrice => {
        this.setState({quoted_price: quotePrice ? quotePrice: ''});
        if (quotePrice > 0) {
            this.loadWeeklyFee(quotePrice);
        }
    }
    setEstimatedOcat = estimatedOcat => {
        this.setState({estimated_ocat: estimatedOcat ? estimatedOcat: ''}) 
    }
    setSubmitFee = submit => {
        this.setState({application_fee: "$" + submit.application});
        this.setState({valuation_fee: "$" + submit.valuation});
    }
    setWeeklyFee = weeklyFee => {
        this.setState({weekly_fee: "$" + weeklyFee + "/W"});
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
		let inputs = this.state.inputs;
        inputs.asset_name = '';
        inputs.asset_type = '';
        inputs.asset_description = '';
        inputs.asset_address_street = '';
        inputs.asset_address_city = '';
        inputs.asset_address_state = '';
        inputs.asset_address_zipcode = '';
        inputs.asset_address_country = '';
        inputs.valuation_report = '';
        inputs.reported_price = 0;
        inputs.convert_ratio = 0;

		this.setState(inputs);
		this.setQuotedPrice('');
		this.setEstimatedOcat('');
    }

    onSelectValuationReport = fileInfo => {
        this.setValuationReport(fileInfo);
    }

    onClickBooking = ev => {
    }

    onClickSubmit = params => {
        this.showConfirm({ id: SUBMIT, context: params });
    }

    onClickToAsset = params => {
        console.log("onClickToAsset(): ", params);
        let { stopWait, getExtraData } = params;
        stopWait();
    }

    onClickSubmitConfirm = async retCode => {
        let { stopWait, getExtraData } = this.closeConfirm();
        if (retCode == 0 || retCode == 1) {
            stopWait();
            return;
        }
        try {
            // First upload valuation report
            let ret = await pawnShopService.upload(this.state.inputs.valuation_report);
            if (ret.error - 0 !== 0) {
                stopWait();
                this.showMessageBox("Failed to submit: " + ret.data, 1);
				this.setValuationReport(null);
                return;
            }
            console.log("Uploading valuation report: ", ret)
            // Then submit to mint a new pawn NFT
            let submitData = this.state.inputs;
            submitData.valuation_report = ret.data;
            ret = await pawnShopService.create({userToken: this.userToken, data: submitData});
            if (ret.error - 0 !== 0) {
                stopWait();
                this.showMessageBox("Failed to create new pawn NFT: " + ret.data, 1);
                return;
            }
            this.setState({new_asset_info: ret.data.new_asset_info});
            console.log(this.state.new_asset_info);
            this.showNewSubmit(ret.data.new_asset_info);
            this.setState({show_submit_success_modal: true});
            stopWait();
            this.clearAllFields();
            this.buildTrackTable({status: 1, data: ret.data.all_assets});
            // this.showMessageBox("Success to create a PNFT for your asset. You can check about it follow track table");
        } catch(error) {
			console.log(error);
			stopWait();
            //this.showMessageBox(error, 1)
        }
    }

    onClickResubmit = ev => {}

    onClickDownloadLegalContract = ev => {
    }

    onClickMint = async (params) => {
        this.showConfirm({ id: MINT, context: params });
    }
    onClickMintConfirm = async retCode => {
        let { stopWait, getExtraData } = this.closeConfirm();
        if (retCode == 0 || retCode == 1) {
            stopWait();
            return;
        }
        let assetId = getExtraData();
        let ret = await pawnShopService.mint({ownerToken: this.userToken, assetId: assetId});
        stopWait();
        if (ret.error - 0 !== 0) {
            this.showMessageBox("Failed to mint: " + ret.data, 1);
            return;
        }
        this.showMessageBox("Success to mint: " + ret.data);
        this.buildTrackTable({status: 1, data: ret.data.all_assets});
    }
    onClickBurn = async (params) => {
        this.showConfirm({ id: BURN, context: params });
    }

    onClickBurnConfirm = async (retCode) => {
        let { stopWait, getExtraData } = this.closeConfirm();
        if (retCode == 0 || retCode == 1) {
            stopWait();
            return;
        }
        let assetId = getExtraData();
        let ret = await pawnShopService.burn({ownerToken: this.userToken, assetId: assetId});
        if (ret.error - 0 !== 0) {
            this.showMessageBox("Failed to burn asset: " + ret.data, 1);
            return;
        }
        this.showMessageBox("Success to burn: " + ret.data);
    }
    onClickLoan = async params => {
        this.showConfirm({ id: LOAN, context: params });
    }
    onClickLoanConfirm = async retCode => {
        let { stopWait, getExtraData } = this.closeConfirm();
        if (retCode == 0 || retCode == 1) {
            stopWait();
            return;
        }
        let assetId = getExtraData();
        let ret = await pawnShopService.loan({ownerToken: this.userToken, assetId: assetId});
        stopWait();
        if (ret.error - 0 !== 0) {
            this.showMessageBox("Failed to loan: " + ret.data, 1);
            return;
        }
        this.showMessageBox("Loaned successfully");
        this.buildTrackTable({status: 1, data: ret.data.all_assets});
    }
    onClickRestore = async params => {
        this.showConfirm({ id: RESTORE, context: params });
    }
    onClickRestoreConfirm = async retCode => {
        let { stopWait, getExtraData } = this.closeConfirm();
        if (retCode == 0 || retCode == 1) {
            stopWait();
            return;
        }
        let assetId = getExtraData();
        let ret = await pawnShopService.restore({ownerToken: this.userToken, assetId: assetId});
        stopWait();
        if (ret.error - 0 !== 0) {
            this.showMessageBox("Failed to return back: " + ret.data, 1);
            return;
        }
        this.showMessageBox("Rerstored successfully");
        this.buildTrackTable({status: 1, data: ret.data.all_assets});
    }
    handleInputChange = ev => {
        let inputs = this.state.inputs;
        inputs[ev.target.name] = ev.target.value;
        this.setState({
            inputs
        });
        if (ev.target.name === 'convert_ratio' || ev.target.name === 'reported_price') {
            let reportedPrice = this.state.inputs.reported_price ? this.state.inputs.reported_price : 0;
            let pricePercentage = this.state.inputs.convert_ratio ? this.state.inputs.convert_ratio: 0;
            if (reportedPrice == 0 || pricePercentage == 0) {
                return;
            }
            if (this.state.prices == undefined || this.state.prices.ocat == undefined) {
                console.log("Not got price of tokens yet. Please wait a while");
                return;
            }
            let ocatPrice = this.state.prices.ocat ? this.state.prices.ocat: 0;
			let quotedPrice = (reportedPrice * pricePercentage * ocatPrice) / 100; 
            this.setQuotedPrice(quotedPrice?quotedPrice:'');

			let estimatedOcat = quotedPrice - quotedPrice * this.estimatedFee;
			this.setEstimatedOcat(estimatedOcat? estimatedOcat: '');
        }
    }

    buildTrackTable = (assetData) => {
		if (assetData.status > 1) { // 2: waiting for load data, 3: no data
	        this.setState({
	            track_table_data: {	status: assetData.status }
	        });
			return;
		}
		let assets = assetData.data;
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
            let statusCol = <span>{ASSET_STATUS_LABELS[record[TRACKING_TABLE_SCHEMA.headers[6].field_name]]}</span>;
            let actionCol = <span></span>;
            switch (record.status) {
            case 2:
                actionCol = <OcxSpinButton
                                extraData={record[TRACKING_TABLE_SCHEMA.headers[1].field_name]}
                                title="Resubmit"
                                onClick={this.onClickResubmit}
                            />
                break;
            case 3:
                actionCol = <span>Resubmitted</span>;
                break;
            case 4: // Once verified, can mint or burn
                actionCol = <OcxDropdownControlList 
                                items={COUNTRIES} 
                                onSelectItem={this.onChangeCountry} 
                                placeholder="Country"
                            >
                                <OcxSpinButton
                                    title="Mint"
                                    extraData={record[TRACKING_TABLE_SCHEMA.headers[1].field_name]} // id
                                    onClick={this.onClickMint}
                                    renderMode="1"
                                />
                                <OcxSpinButton
                                    extraData={record[TRACKING_TABLE_SCHEMA.headers[1].field_name]} // id
                                    title="Burn"
                                    onClick={this.onClickBurn}
                                    renderMode="1"
                                />
                            </OcxDropdownControlList>
                // actionCol = <div>
                //                 <OcxSpinButton
                //                     title="Mint"
                //                     extraData={record[TRACKING_TABLE_SCHEMA.headers[1].field_name]}
                //                     onClick={this.onClickMint}
                //                 />
                //                 <OcxSpinButton
                //                     id={"tracking-item-burn-" + record[TRACKING_TABLE_SCHEMA.headers[1].field_name]} 
                //                     extraData={record[TRACKING_TABLE_SCHEMA.headers[1].field_name]}
                //                     title="Burn"
                //                     onClick={this.onClickBurn}
                //                 />
                //             </div>
                break;
            case 5:// Once minted, can swap into OCAT
                actionCol = <OcxSpinButton 
                                extraData={record[TRACKING_TABLE_SCHEMA.headers[1].field_name]}
                                title="Loan"
                                onClick={this.onClickLoan} 
                                renderMode="1"
                            />
                break;
            case 6:
                actionCol = <OcxSpinButton
                                extraData={record[TRACKING_TABLE_SCHEMA.headers[1].field_name]}
                                title="Restore"
                                onClick={this.onClickRestore}
                                renderMode="1"
                            />
                break;
            default:
                break;
            }

            let row = {
                id: record[TRACKING_TABLE_SCHEMA.headers[1].field_name],
                data: [
                    { value: new Date(record[TRACKING_TABLE_SCHEMA.headers[0].field_name]).toLocaleString() },
                    { value: record[TRACKING_TABLE_SCHEMA.headers[1].field_name] },
                    { value: record[TRACKING_TABLE_SCHEMA.headers[2].field_name] },
                    { value: record[TRACKING_TABLE_SCHEMA.headers[3].field_name] },
                    { value: record[TRACKING_TABLE_SCHEMA.headers[4].field_name] },
                    { value: record[TRACKING_TABLE_SCHEMA.headers[5].field_name] },
                    { value: statusCol },
                    { value: actionCol },
                ]
            };
            trackTableData.push(row);
        });
        this.setState({
            track_table_data: {
				status: 1,
				data: trackTableData
			}
        });
    }

    async updateTrackTable() {
        this.buildTrackTable({status: 2}); // Waiting status for data
        let ret = await pawnShopService.getPawnAssets({userToken: this.userToken});
        if (ret.error - 0 < 0) {
            this.showMessageBox("Failed to update track table: " + ret.data, 1);
            return;
        } else if (ret.error > 0) {
            this.buildTrackTable({status: 3}); // No data for the table
            this.showMessageBox(ret.data, 2);
            return;
        }
        this.buildTrackTable({status: 1, data: ret.data});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    setEncryptKey(encryptKey) {
        rsaCrypt.setPublicKey(encryptKey);
        this.rsaCryptInited = true;
    }

    showMessageBox = (msg, type) => {
        if (!msg) {
            return;
        }
        this.props.showToast(type, msg);
    }

    render() {
        return (
            <div className="my-pawnshop-page main-font main-color font-16">
                { 
                    this.state.pageSpin? <OcxPageSpinner />
                        :
                        <div className="pawnshop-main-frame">
                    <div className="pawn-panel">
                        {
                            this.state.show_submit_success_modal ? 
                            <OcxModal 
                                title="Success"
                                show={this.state.show_submit_success_modal}
                            >
                            Minted PNFT for your asset successfully
                            {this.state.submit_success_info}
                            </OcxModal>
                            :<></>
                        }
                        <OcxCard title='Pawn your assets into cryptos'>
                            <div className="mt-10">
                                <div className="inline-flex w-full">
                                    <div className="w-4/12 mr-5" text-align="right">
                                        {/* <p className="block">Asset Type:</p> */}
                                        <DropdownList 
                                            items={ASSET_TYPES} 
                                            onSelectItem={this.onChangeAssetType} 
                                            placeholder="Asset Type"
                                        />
                                    </div>
                                    <div className="w-4/12">
                                        <OcxInput 
                                            name="asset_name"
                                            id="asset_name"
                                            placeholder="Asset Name"
                                            value={this.state.asset_name}
                                            onChange={this.handleInputChange} 
                                        />
                                   </div>
                                </div>
                            </div>
                            <div className="mt-20">
                                <div className="inline-flex w-full">
                                    <div className="w-4/12 mr-5">
                                        <OcxInput
                                            name="asset_description"
                                            id="asset_description"
                                            placeholder="Asset Description"
                                            value={this.state.asset_description}
                                            onChange={this.handleInputChange}
                                        />                    
                                    </div>
                                    <div className="w-4/12 mr-5">
                                        <OcxInput
                                            name="asset_address_street"
                                            id="asset_address_street"
                                            placeholder="Asset Address"
                                            value={this.state.asset_address_street}
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                    <div className="w-4/12 mr-5">
                                        {/* <label>City</label> */}
                                        <OcxInput
                                            name="asset_address_city"
                                            id="asset_address_city"
                                            placeholder="City"
                                            value={this.state.asset_address_city}
                                            onChange={this.handleInputChange}
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
                                            <OcxInput
                                                type="number"
                                                name="asset_address_zipcode"
                                                id="asset_address_zipcode"
                                                placeholder="Zip Code"
                                                value={this.state.asset_address_zipcode}
                                                onChange={this.handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-20">
                                    <div className="inline-flex w-full">
                                        <div className="mr-5">
                                            {/* <label>Valuation Price</label> */}
                                            <OcxInput
                                                type="number"
                                                name="reported_price"
                                                id="reported_price"
                                                placeholder="Valuation Price"
                                                value={this.state.inputs.reported_price}
                                                onChange={this.handleInputChange}
                                            />
                                        </div>
                                        <div className="mr-5">
                                            {/* <label>Percentage of value</label> */}
                                            <OcxInput
                                                type="number"
                                                name="convert_ratio"
                                                id="convert_ratio"
                                                placeholder="Pawn to Token Ratio"
                                                value={this.state.inputs.convert_ratio}
                                                onChange={this.handleInputChange}
                                            />
                                        </div>
                                        <div className="mr-5">
                                            {/* <label>Quote Price</label> */}
                                            <OcxInput
                                                type="number"
                                                name="quoted_price"
                                                id="quoted_price"
                                                placeholder="Quoted Price"
                                                readOnly={true}
                                                value={this.state.quoted_price}
                                            />
                                        </div>
                                        <div className="mr-5">
                                            {/* <label>Estimated OCAT</label> */}
                                            <OcxInput
                                                type="number"
                                                name="estimated_ocat"
                                                id="estimated_ocat"
                                                placeholder="Estimated OCAT"
                                                value={this.state.estimated_ocat}
                                                readOnly={true}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <div className="inline-flex w-full">
                                        <div className="w-3/12 mr-5">
                                            <label>Application Fee</label>
                                            <div className="w-full">
                                                <OcxInput
                                                    name="application_fee"
                                                    additionalClassName="text-right"
                                                    id="application_fee"
                                                    placeholder="Application Fee"
                                                    value={this.state.application_fee}
                                                    readOnly={true}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-3/12 mr-5">
                                            <label>Valuation Fee</label>
                                            <div className="w-full">
                                                <OcxInput
                                                    name="valuation_fee"
                                                    additionalClassName="text-right"
                                                    id="valuation_fee"
                                                    placeholder="Valuation Fee"
                                                    value={this.state.valuation_fee}
                                                    readOnly={true}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-3/12 mr-5">
                                            <label>Weekly Fee</label>
                                            <div className="w-full">
                                                <OcxInput
                                                    name="weekly_fee"
                                                    additionalClassName="text-right"
                                                    id="weekly_fee"
                                                    placeholder="Weekly Fee"
                                                    value={this.state.weekly_fee}
                                                    readOnly={true}
                                                    autoComplete="off"
                                                />
                                            </div>
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
                                        <div className="w-3/12 mr-5">
                                            <label>You don't have a valuation report book a valuation time and date</label>
                                            <button
                                                className="block border border-grey-light button-bg p-3 hover-transition main-font focus:outline-none rounded text-white verify-button"
                                                onClick={this.onClickBooking}
                                            >Booking me</button>
                                        </div>
                                        <div className="w-3/12 mr-5">
                                            <a href="#" className="px-4 py-1  text-blue-500 bg-blue-200 rounded-lg">Click here to download legal contract</a>
                                        </div>
                                    </div>
                                </div>
                                <hr className="mt-5"/>
                                <div className="mt-5 flex justify-end   ">
                                    {/* <button
                                        className="border border-grey-light button-bg p-5 hover-transition main-font focus:outline-none rounded text-white verify-button"
                                        onClick={this.onClickSubmit}
                                    >Submit</button> */}
                                    <OcxSpinButton
                                        title="Submit"
                                        onClick={this.onClickSubmit}
                                    />
                                    <OcxSpinButton
                                        title="To Asset page"
                                        onClick={this.onClickToAsset}
                                    />
                                </div>
                            </div>
                        </OcxCard>
                    </div>
                    <div>
                    {
                        this.state.show_confirm ?
                        <OcxConfirm 
                            show={true}
                            onClick={ this.state.confirm_handler }
                        >{ this.state.confirm_text }</OcxConfirm>
                        :<></>
                    }
                    </div>
                    <div className="tracking-table-panel">
                        <OcxCard title='Tracking' header_separator={false} >
                            <OcxSimpleTable 
                                colDef={TRACKING_TABLE_SCHEMA} 
                                tableData={this.state.track_table_data}
                            />
                        </OcxCard>
                    </div>
                        </div>
                }
            </div>
        );
    }

}

export default PawnShopPage;
