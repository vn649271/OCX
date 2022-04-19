import React, { Component } from 'react';
import { BACKEND_BASE_URL } from '../../../Contants';
import DropdownList from '../../common/DropdownList';
import OcxDropdownControlList from '../../common/OcxDropdownControlList';
import AccountService from '../../../service/Account';
import PreFileUploadForm from '../../common/PreFileUploadForm';
import PawnShopService from '../../../service/PawnShop';
import { JSEncrypt } from 'jsencrypt'
import DelayButton from '../../common/DelayButton';
import OcxCard from '../../common/OcxCard';
import OcxInput from '../../common/OcxInput';
import SimpleTable from '../../common/SimpleTable';
import SpinButton from '../../common/SpinButton';
import OcxConfirm from '../../common/OcxConfirm';
import OcxBasicButton from '../../common/OcxBasicButton';

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
        { title: 'Estimated OCAT' },
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
            price: '',
            price_percentage: '',
        },
		quote_price: '',
        estimated_ocat: '',
		estimated_fee: 0,
		estimated_fee_text: 'A$350 + A$6/Day',
        show_submit_confirm: false,
        show_mint_confirm: false,
        show_burn_confirm: false,
        track_table_data: null,
    }

    constructor(props) {
        super(props);
        self = this;

        this.submitButtonContext = null;
        this.mintButtonContext = null;
        this.burnButtonContext = null;
        this.valuation_report = null;
        this.priceMonitorTimer = null;
		this.prices = {};

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
        this.setPricePercentage = this.setPricePercentage.bind(this);
        this.setQuotePrice = this.setQuotePrice.bind(this);
        this.setEstimatedOcat = this.setEstimatedOcat.bind(this);
        this.setEstimatedFee = this.setEstimatedFee.bind(this);

        // Event Handler
        this.onChangeAssetType = this.onChangeAssetType.bind(this);
        this.onChangeCountry = this.onChangeCountry.bind(this);
        this.onChangeStateName = this.onChangeStateName.bind(this);

        this.onClickBooking = this.onClickBooking.bind(this);
        this.onClickSubmit = this.onClickSubmit.bind(this);
        this.onClickSubmitConfirm = this.onClickSubmitConfirm.bind(this);
        this.onClickResubmit = this.onClickResubmit.bind(this);
        this.onSelectValuationReport = this.onSelectValuationReport.bind(this);
        this.onClickMint = this.onClickMint.bind(this);
        this.onClickMintConfirm = this.onClickMintConfirm.bind(this);
        this.onClickBurn = this.onClickBurn.bind(this);
        this.onClickLoan = this.onClickLoan.bind(this);
        this.onClickRestore = this.onClickRestore.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.buildTrackTable = this.buildTrackTable.bind(this);
        this.updateTrackTable = this.updateTrackTable.bind(this);

        this.showMessageBox = this.showMessageBox.bind(this);
    }

    async componentDidMount() {
        this.buildTrackTable({status: 2}); // Waiting status for data

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
        console.log("Get all pawn assets items for the user");
        // this.trackTableUpdateTimer = setInterval(this.updateTrackTable, 60000);
        this.updateTrackTable();
    }

    componentWillUnmount = () => {
        if (this.priceMonitorTimer) {
            clearInterval(this.priceMonitorTimer);
        }
    }

    startPriceMonitor = () => {
        this.priceMonitorTimer = setInterval(this.priceMonitor, 10000);
		this.priceMonitor();
    }

    priceMonitor = async () => {
        accountService.getPrices({
			userToken: this.userToken
		}).then(ret => {
			if (ret.error != undefined && ret.error == 0) {
			    self.prices = ret.data;
				if (self.prices['PNFT_MINT_FEE']) {
					self.setEstimatedFee(self.prices['PNFT_MINT_FEE']);
				}
		    	console.log("PRICES: ",ret.data);
			}
		});
    }

    setPrices = prices => {
        this.setState({prices: prices});
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
        this.setState({quote_price: quotePrice ? quotePrice: ''}) 
    }

    setEstimatedOcat = estimatedOcat => {
        this.setState({estimated_ocat: estimatedOcat ? estimatedOcat: ''}) 
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
        inputs.price = 0;
        inputs.price_percentage = 0;

		this.setState(inputs);
		this.setQuotePrice('');
		this.setEstimatedOcat('');
    }

    onSelectValuationReport = fileInfo => {
        this.setValuationReport(fileInfo);
    }

    onClickBooking = ev => {
    }

    onClickSubmit = (param, ev, btnCmpnt) => {
        this.submitButtonContext = {
            param: param,
            ev: ev,
            btnCmpnt: btnCmpnt
        };
        this.setState({show_submit_confirm: true});
    }

    onClickSubmitConfirm = async (ret) => {
        this.setState({show_submit_confirm: false});
        let {param, ev, btnCmpnt} = this.submitButtonContext;
        this.submitButtonContext = null;
        if (ret == 0 || ret == 1) {
            btnCmpnt.stopTimer();
            return;
        }
        try {
            // First upload valuation report
            let ret = await pawnShopService.upload(this.state.inputs.valuation_report);
            if (ret.error - 0 !== 0) {
                btnCmpnt.stopTimer();
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
                btnCmpnt.stopTimer();
                this.showMessageBox("Failed to create new pawn NFT: " + ret.data, 1);
                return;
            }

            this.setState({new_asset_id: ret.data.new_id});
            btnCmpnt.stopTimer();
            this.clearAllFields();
            this.buildTrackTable({status: 1, data: ret.data.all_assets});
            this.showMessageBox("Success: " + ret.data);
        } catch(error) {
			console.log(error);
			btnCmpnt.stopTimer();
            //this.showMessageBox(error, 1)
        }
    }

    onClickResubmit = ev => {}

    onClickDownloadLegalContract = ev => {
    }

    onClickMint = async (params) => {
        this.mintButtonContext = {
            stopWait: params.stopWait,
            getExtraData: params.getExtraData
        };
        this.setState({show_mint_confirm: true});
    }

    // onClickMintConfirm = async (params, ev, buttonComponent) => {
    onClickMintConfirm = async ret => {
        this.setState({show_mint_confirm: false});
        let { stopWait, getExtraData } = this.mintButtonContext;
        this.mintButtonContext = null;

        if (ret == 0 || ret == 1) {
            stopWait();
            return;
        }

        let assetId = getExtraData();
        ret = await pawnShopService.mint({ownerToken: this.userToken, assetId: assetId});
        stopWait();
        if (ret.error - 0 !== 0) {
            this.showMessageBox("Failed to mint: " + ret.data, 1);
            return;
        }
        this.showMessageBox("Success to mint: " + ret.data);
        this.buildTrackTable({status: 1, data: ret.data.all_assets});
    }

    onClickBurn = async (params) => {
        this.burnButtonContext = {
            stopWait: params.stopWait,
            getExtraData: params.getExtraData
        };
        this.setState({show_burn_confirm: true});
    }

    onClickBurnConfirm = async (retCode) => {
        this.setState({show_burn_confirm: false});
        let { stopWait, getExtraData } = this.burnButtonContext;
        this.burnButtonContext = null;
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

    onClickLoan = async (ev) => {
        let assetId = ev.target.id.replace("tracking-item-loan-", "");
        let ret = await pawnShopService.loan({ownerToken: this.userToken, assetId: assetId});
        
        if (ret.error - 0 !== 0) {
            this.showMessageBox("Failed to loan: " + ret.data, 1);
            return;
        }
        this.showMessageBox("Loaned successfully");
        this.buildTrackTable({status: 1, data: ret.data.all_assets});
    }

    onClickRestore = async (ev) => {
        let assetId = ev.target.id.replace("tracking-item-restore-", "");
        let ret = await pawnShopService.restore({ownerToken: this.userToken, assetId: assetId});
        
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
        if (ev.target.name === 'price_percentage' || ev.target.name === 'price') {
            let reportedPrice = this.state.inputs.price ? this.state.inputs.price : 0;
            let quote = this.state.inputs.price_percentage ? this.state.inputs.price_percentage: 0;
			let quotedPrice = (reportedPrice * quote) / 100; 
            this.setQuotePrice(quotedPrice?quotedPrice:'');
			let ocatPrice = this.prices['OCAT'] ? this.prices['OCAT']: 0;
			let pnftMintFee = this.prices['PNFT_MINT_FEE'] ? this.prices['PNFT_MINT_FEE']: 0;
			let estimatedOcat = quotedPrice - quotedPrice * ocatPrice * pnftMintFee;
			this.setEstimatedOcat(estimatedOcat? estimatedOcat: '');
        }
    }

    buildTrackTable = (assetData) => {
		if (assetData.status == 2) { // is waiting to load data?
	        this.setState({
	            track_table_data: {	status: 2 }
	        });
			return;
		}
		let assets = assetData.data;
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
                actionCol = <SpinButton
                                id={"tracking-item-resubmit-" + record.id} 
                                extraData={record.id}
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
                                <SpinButton
                                    title="Mint"
                                    extraData={record.id}
                                    onClick={this.onClickMint}
                                    renderMode="1"
                                />
                                <SpinButton
                                    extraData={record.id}
                                    title="Burn"
                                    onClick={this.onClickBurn}
                                    renderMode="1"
                                />
                            </OcxDropdownControlList>
                // actionCol = <div>
                //                 <SpinButton
                //                     title="Mint"
                //                     extraData={record.id}
                //                     onClick={this.onClickMint}
                //                 />
                //                 <SpinButton
                //                     id={"tracking-item-burn-" + record.id} 
                //                     extraData={record.id}
                //                     title="Burn"
                //                     onClick={this.onClickBurn}
                //                 />
                //             </div>
                break;
            case 5:// Once minted, can swap into OCAT
                actionCol = <SpinButton 
                                id={"tracking-item-loan-" + record.id} 
                                extraData={record.id}
                                title="Loan"
                                onClick={this.onClickLoan} 
                            />
                break;
            case 6:
                actionCol = <SpinButton
                                id={"tracking-item-restore-" + record.id} 
                                extraData={record.id}
                                title="Restore"
                                onClick={this.onClickRestore}
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
                    { value: record.estimated_ocat },
                    { value: record.estimated_fee },
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
        let ret = await pawnShopService.getPawnAssets({userToken: this.userToken});
        if (ret.error - 0 < 0) {
            this.showMessageBox("Failed to update track table: " + ret.data, 1);
            return;
        } else if (ret.error > 0) {
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
            <div>
                <div className="my-pawnshop-page main-font main-color font-16">
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
                                            name="price"
                                            id="price"
                                            placeholder="Valuation Price"
                                            value={this.state.inputs.price}
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                    <div className="mr-5">
                                        {/* <label>Percentage of value</label> */}
                                        <OcxInput
                                            type="number"
                                            name="price_percentage"
                                            id="price_percentage"
                                            placeholder="Pawn to Token Ratio"
                                            value={this.state.inputs.price_percentage}
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                    <div className="mr-5">
                                        {/* <label>Quote Price</label> */}
                                        <OcxInput
                                            type="number"
                                            name="quote_price"
                                            id="quote_price"
                                            placeholder="Quote Price"
                                            readOnly={true}
                                            value={this.state.quote_price}
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
                                            className="block border border-grey-light button-bg p-3 hover-transition main-font focus:outline-none rounded text-white verify-button"
                                            onClick={this.onClickBooking}
                                        >Booking me</button>
                                    </div>
                                    <div className="w-4/12 mr-5">
                                        <label>Estimated Fee</label>
										<div className="w-1/2">
	                                        <OcxInput
            	                                name="estimated_fee"
                	                            id="estimated_fee"
                    	                        placeholder="Estimated Fee"
                        	                    value={this.state.estimated_fee_text}
												readOnly={true}
                                	            autoComplete="off"
                                    	    />
										</div>
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
                    </OcxCard>
                </div>
                <div>
                {
                    // Submit Confirm Dialog
                    // this.state.show_submit_confirm ? 
                    // <OcxConfirmDialog 
                    //     onClick={ this.onClickSubmitConfirm }
                    // >Are you sure to submit?</OcxConfirmDialog>
                    // :<></>
                    this.state.show_submit_confirm ? 
                    <OcxConfirm 
                        show={true}
                        onClick={ this.onClickSubmitConfirm }
                    >Are you sure to submit?</OcxConfirm>
                    :<></>

                }
                {
                    // Mint Confirm Dialog
                    this.state.show_mint_confirm ? 
                    <OcxConfirm
                        show={true}
                        onClick={ this.onClickMintConfirm }
                    >Are you sure to mint?</OcxConfirm>
                    :<></>
                }
                {
                    // Burn Confirm Dialog
                    this.state.show_burn_confirm ? 
                    <OcxConfirm
                        show={true}
                        onClick={ this.onClickBurnConfirm }
                    >Are you sure to burn?</OcxConfirm>
                    :<></>
                }
                </div>
                <div className="my-pawnshop-page main-font main-color font-16 mt-16">
                    <OcxCard title='Tracking'>
                        <SimpleTable 
                            colDef={TRACKING_TABLE_SCHEMA} 
                            tableData={this.state.track_table_data}
                        />
                    </OcxCard>
                </div>
            </div>
        );
    }

}

export default PawnShopPage;
