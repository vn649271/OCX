import React, { Component } from 'react';
import DelayButton from '../../common/DelayButton';
import OcxPasswordChecklist from "../../common/OcxPasswordChecklist";
import AccountService from '../../../service/Account';
import { hashCode } from "../../../service/Utils";
import QRCode from "react-qr-code";
import { BALANCE_CHECKING_INTERVAL } from "../../../Contants";
import PassphraseImportDialog from '../../common/PassphraseImportDialog';
import PasscodeConfirmDialog from '../../common/PasscodeConfirmDialog';
import SelectDropdown from '../../common/SelectDropdown';
import Button from "@material-tailwind/react/Button";
import randomWords from 'random-words';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { JSEncrypt } from 'jsencrypt'
import PageTabBar from '../../common/PageTabBar';
import ExchangeSwap from '../../common/exchange/ExchangeSwap';

var rsaCrypt = new JSEncrypt();
const accountService = new AccountService();

const eye = <FontAwesomeIcon icon={faEye} />;

const MAX_CREATING_DELAY_TIMEOUT = 10
const UNKNOWN_USER = 0;
const NEW_USER = 1;
const USER_WITH_ACCOUNT = 2;

const IDLE = 0,
    LOCKING = 1,
    SENDING = 2;

const walletPageTabItems = [
    {
        name: 'transfer-tab',
        title: 'Transfer'
    },
    {
        name: 'swap-tab',
        title: 'Swap'
    },
];

var self;

class WalletPage extends Component {

    constructor(props) {
        super(props);
        self = this;

        this.state = {
            is_creating: false,
            current_tab: "transfer-tab",
            user_mode: UNKNOWN_USER,
            creating_interval: MAX_CREATING_DELAY_TIMEOUT,
            current_state: IDLE,
            balance: {
                eth: 0,
                btc: 0,
            },
            price: {
                ETH: 0,
                BTC: 0,
                UNI: 0,
                DAI: 0,
                OCAT: 0,
                PNFT: 0
            },
            input: {
                passphrase: '',
                to_address: '0xADB366C070DFB857DC63ebF797EFE615B0567C1B',
            },
            error: "",
            info: "",
            accounts: {},
            locked: true,
            password: "",
            confirm_password: "",
            showPassword: false,
            hide_password_checklist: true,
            show_passphrase_import_dialog: false,
            show_passcode_confirm_dialog: false,
            loading: false,
            show_passphrase: false,
            token_info_list: null
        }

        this.userToken = null;
        this.encryptKey = null;
        this.balanceTimer = null;
        this.userPasswordToConfirmTx = "";
        this.rsaCryptInited = false;
        this.encryptedPassphrase = null;
        this.unlockButton = null;
        this.tempStorage = {};
        this.priceMonitorTimer = null;

        this.onCreateAccont = this.onCreateAccont.bind(this);
        this.onTransfer = this.onTransfer.bind(this);
        this.onLeaveFromPasswordInput = this.onLeaveFromPasswordInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onKeyPressedForUnlock = this.onKeyPressedForUnlock.bind(this);
        this.togglePasswordVisiblity = this.togglePasswordVisiblity.bind(this);
        this.togglePassphraseVisiblity = this.togglePassphraseVisiblity.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.inform = this.inform.bind(this);
        this.warning = this.warning.bind(this);
        this.setSendingAmountInUI = this.setSendingAmountInUI.bind(this);
        this.setBalanceInUI = this.setBalanceInUI.bind(this);
        this.setPriceInUI = this.setPriceInUI.bind(this);
        this.setPasswordInUI = this.setPasswordInUI.bind(this);
        this.onUnlockAccont = this.onUnlockAccont.bind(this);
        this.onLockAccont = this.onLockAccont.bind(this);
        this.onClickImportPassphrase = this.onClickImportPassphrase.bind(this);
        this.onOkPassphraseImportDialog = this.onOkPassphraseImportDialog.bind(this);
        this.onCancelPassphraseImportDialog = this.onCancelPassphraseImportDialog.bind(this);
        this.openPasscodeConfirmDialog = this.openPasscodeConfirmDialog.bind(this);
        this.onOkPasscodeConfirmDialog = this.onOkPasscodeConfirmDialog.bind(this);
        this.onCancelPasscodeConfirmDialog = this.onCancelPasscodeConfirmDialog.bind(this);
        this.onGeneratePassphrase = this.onGeneratePassphrase.bind(this);
        this.setEncryptKey = this.setEncryptKey.bind(this);
        this.onSelectTab = this.onSelectTab.bind(this);
        this.startBalanceMonitor = this.startBalanceMonitor.bind(this);
        this._startBalanceMonitor = this._startBalanceMonitor.bind(this);
        this.buildTokenList = this.buildTokenList.bind(this);
        this._transfer = this._transfer.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    async componentDidMount() {
        console.log("*************componentDidMount()*************");
        this.userToken = localStorage.getItem("userToken");
        this.encryptKey = localStorage.getItem("encryptKey");
        this.setEncryptKey(this.encryptKey);
        let ret = await accountService.getTokenList({
            userToken: self.userToken
        });
        if (ret.error !== 0) {
            self.warning("Failed to get token list");
            return;
        }
        console.log("''''''''''''''''''''''''''''''", ret.data);
        this.setState({token_info_list: ret.data});

        // Try to connect to my account
        let resp = await accountService.connectAccount({
            userToken: self.userToken
        });
        var errorMsg = null;
        if (resp.error !== undefined) {
            switch (resp.error) {
                case 0:
                    self.setState({ accounts: resp.data.addresses });
                    self.setState({ user_mode: USER_WITH_ACCOUNT });
                    self.setState({ locked: resp.data.locked });
                    this.startBalanceMonitor();
                    this.startPriceMonitor();
                    this.onGeneratePassphrase(null);
                    return;
                case 51:
                case 52:
                    self.setState({ user_mode: NEW_USER });
                    return;
                case -1000:
                    errorMsg = "No response for get balance";
                    break;
                default:
                    errorMsg = resp.data
                    break;
            }
        } else {
            errorMsg = "Invalid response for connecting to my account"
        }
        self.warning(errorMsg);
    }

    componentWillUnmount() {
        if (this.balanceTimer) {
            clearInterval(this.balanceTimer);
            this.balanceTimer = null;
        }
        if (this.priceMonitorTimer) {
            clearInterval(this.priceMonitorTimer);
            this.priceMonitorTimer = null;
        }            
    }

    async _startBalanceMonitor() {
        console.log("balance function(): user_mode=", self.state.user_mode);
        if (self.state.user_mode !== USER_WITH_ACCOUNT) {
            return;
        }
        accountService.getBalances({
            userToken: self.userToken
        }).then(resp => {
            var errorMsg = null;
            if (resp.error === 0) {
                for (let i in resp.data) {
                    if (i !== 'PNFT') {
                        self.setBalanceInUI(i, (resp.data[i] - 0).toFixed(4));
                    } else {
                        self.setBalanceInUI(i, resp.data[i]);
                    }
                }
                return;
            } else if (resp.error === -1000) {
                errorMsg = "No response for get balance";
            } else if (resp.error !== 0) {
                errorMsg = resp.data
            }
            self.warning(errorMsg);
        });
    }

    async startBalanceMonitor() {
        if (this.balanceTimer !== null || this.state.locked !== false) {
            return;
        }
        this.balanceTimer = setInterval(this._startBalanceMonitor, BALANCE_CHECKING_INTERVAL);
        this._startBalanceMonitor();
    }

    startPriceMonitor = async () => {
        const axios = require("axios");
        this.priceMonitorTimer = setInterval(
            function() {
                var tokens = ['ETH', 'DAI', 'UNI'];
                for (let i in tokens) {
                    const options = {
                        method: 'GET',
                        url: 'https://api.coinbase.com/v2/prices/' + tokens[i] + '-USD/historic?period=hour',
                    };

                    axios.request(options).then(function (response) {
                        let priceData = response.data ? response.data.data ? response.data.data.prices ?
                                        response.data.data.prices[0] : 0 : 0: 0;
                        console.log("+++++++++++++++++ ", priceData);
                        self.setPriceInUI(tokens[i], priceData.price);
                    }).catch(function (error) {
                        console.error(error);
                    });
                }
            }, 
            BALANCE_CHECKING_INTERVAL
        );
        // accountService.getPrices({
        //     userToken: self.userToken
        // }).then(resp => {
        //     var errorMsg = null;
        //     if (resp.error === 0) {
        //         for (let i in resp.data) {
        //             self.setPriceInUI(i, (resp.data[i] - 0).toFixed(4));
        //         }
        //         return;
        //     } else if (resp.error === -1000) {
        //         errorMsg = "No response for get balance";
        //     } else if (resp.error !== 0) {
        //         errorMsg = resp.data
        //     }
        //     self.warning(errorMsg);
        // });
    }

    setEncryptKey(encryptKey) {
        rsaCrypt.setPublicKey(encryptKey);
        this.rsaCryptInited = true;
    }

    togglePasswordVisiblity = event => {
        // let password = event.target.parentNode.parentNode.parentNode.firstElementChild.value;
        this.setState({ showPassword: !this.state.showPassword });
    }

    togglePassphraseVisiblity = event => {
        // let password = event.target.parentNode.parentNode.parentNode.firstElementChild.value;
        this.setState({ show_passphrase: !this.state.show_passphrase });
    }

    handleInputChange = event => {
        this.warning('');
        let input = this.state.input;
        input[event.target.name] = event.target.value;
        this.setState({
            input
        });
        if (event.target.name === 'password') {
            this.setState({ hide_password_checklist: false });
            let password = input['password'] || "";
            if (password === null) {
                password = "";
            }
        } else if (event.target.name === 'confirm_password') {
            let password = input['password'];
            let confirmPassword = input['confirm_password'];
            if (confirmPassword !== password) {
                this.warning('Password mismatch');
            }
        }
    }

    onKeyPressedForUnlock = ev => {
        // if (this.unlockButton) {
        //     this.unlockButton.onClickButton();
        // }
    }

    inform = (msg) => {
        if (typeof msg === 'object') {
            msg = msg.toString();
        }
        this.setState({ info: msg });
        this.setState({ error: '' });
    }

    warning = (msg) => {
        if (typeof msg === 'object') {
            msg = msg.toString();
        }
        this.setState({ error: msg });
        this.setState({ info: '' });
    }

    setSendingAmountInUI = (amount) => {
        let input = self.state.input;
        input.amount = amount;
        this.setState({ input: input });
    }

    setBalanceInUI = (token, balance) => {
        var balanceMsg = this.state.balance;
        balanceMsg[token] = balance;
        this.setState({ balance: balanceMsg });
    }

    setPriceInUI = (token, price) => {
        var priceMsg = this.state.price;
        priceMsg[token] = price;
        this.setState({ price: priceMsg });
    }

    setPasswordInUI = password => {
        let input = this.state.input;
        input.password = password;
        this.setState({ input: input });
    }

    validatePassword = (password, confirmPassword) => {
        var re = {
            'lowercase': /(?=.*[a-z])/,
            'uppercase': /(?=.*[A-Z])/,
            'numeric_char': /(?=.*[0-9])/,
            'special_char': /(?=.[!@#$%^&<>?()\-+*=|{}[\]:";'])/,
            'atleast_8': /(?=.{8,})/
        };
        if (!re.lowercase.test(password))
            return -1;
        if (!re.uppercase.test(password))
            return -2;
        if (!re.numeric_char.test(password))
            return -3;
        if (!re.special_char.test(password))
            return -4;
        if (!re.atleast_8.test(password))
            return -5;
        if (password !== confirmPassword)
            return -6;
        return 0;
    }

    onSelectTab = tabName => {
        this.setState({ current_tab: tabName })
    }

    onCreateAccont = async (param, ev, btnCmpnt) => {
        let passwordValidation = this.validatePassword(
            this.state.input.password,
            this.state.input.confirm_password
        );
        if (passwordValidation < 0) {
            this.warning("Invalid password");
            return;
        }
        // Perform additional validation for email-phone
        // If required action performed, btnCmpnt.stopTimer() must be called to stop loading
        if (this.userToken === null) {
            this.warning("Error: user token invalid(null)");
            return;
        }
        if (this.encryptedPassphrase.trim() === "") {
            this.warning("Invalid passphrase");
            return;
        }
        let resp = await accountService.createAccount({
            userToken: this.userToken,
            password: hashCode(this.state.input.password),
            passphrase: this.encryptedPassphrase
        });
        btnCmpnt.stopTimer();
        if (resp.error === 0) {
            self.setState({ locked: false });
            self.setState({ accounts: resp.data });
            self.warning('');
            self.setState({ user_mode: USER_WITH_ACCOUNT });
            return;
        } else if (resp.error === -1000) {
            self.warning("Invalid response for creating account");
            return;
        }
        self.warning(resp.data);
    }

    onLockAccont = async (param, ev, btnCmpnt) => {
        this.warning('');
        if (this.state.current_state !== IDLE) {
            btnCmpnt.stopTimer();
            this.warning('Could not perform the current action during another one');
            return;
        }
        // Try to unlock
        this.setState({ current_state: LOCKING });
        let resp = await accountService.lockAccount({
            userToken: this.userToken,
        });
        this.setState({ current_state: IDLE });
        btnCmpnt.stopTimer();
        if (this.balanceTimer) {
            clearInterval(this.balanceTimer);
            this.balanceTimer = null;
        }
        this.warning('');
        if (resp.error === 0) {
            // Display unlocked account page
            self.setState({ locked: true });
            return;
        } else if (resp.error === -1000) {
            self.warning("Invalid response for locking account");
            return;
        }
        self.warning(resp.data);

    }

    onUnlockAccont = async (param, ev, btnCmpnt) => {
        this.startBalanceMonitor();
        console.log("onUnlockAccont(): ", param, ev, btnCmpnt);
        this.warning('');
        // Try to unlock
        let resp = await accountService.unlockAccount({
            userToken: this.userToken,
            password: hashCode(this.state.input.password),
        });
        if (btnCmpnt) {
            btnCmpnt.stopTimer();
        }
        if (resp.error === 0) {
            // Display unlocked account page
            self.warning('');
            self.setPasswordInUI('');
            self.setState({ locked: false });
            return;
        } else if (resp.error === -1000) {
            self.warning("Invalid response for locking account");
            return;
        }
        self.warning(resp.data);
    }

    buildTokenList = tokenInfoArray => {
        var tokenItems = tokenInfoArray.map((tokenInfo) =>
            tokenInfo ? <div address={tokenInfo.address} className="main-font font-16"><img src={tokenInfo.logo.src} width="48" height="48" />{tokenInfo.symbol}</div> : <></>
        );
        return <li>{tokenItems}</li>;
    }

    onTransfer = async (param, ev, btnCmpnt) => {
        this.openPasscodeConfirmDialog(param, ev, btnCmpnt);
        return;
    }

    _transfer = async (param, ev, btnCmpnt) => {
        this.warning('');
        if (this.state.current_state !== IDLE) {
            btnCmpnt.stopTimer();
            this.warning('Could not perform the current action during another one');
            return;
        }
        let toAddress = this.state.input ? this.state.input.to_address ? this.state.input.to_address : null : null;
        if (toAddress === null) {
            btnCmpnt.stopTimer();
            this.warning("Please input receiving address");
            return;
        }
        if (toAddress.trim().length !== 42) {
            btnCmpnt.stopTimer();
            this.warning("Please input valid receiving address");
            return;
        }

        let amount = this.state.input ? this.state.input.amount ? this.state.input.amount : null : null;
        if (amount === null || amount.trim() === "") {
            btnCmpnt.stopTimer();
            this.warning("Please input the amount to send");
            return;
        }

        this.setState({ current_state: SENDING });

        let resp = await accountService.sendCryptoCurrency({
            userToken: this.userToken,
            toAddress: toAddress,
            amount: amount,
            password: hashCode(this.userPasswordToConfirmTx)
        });
        this.setState({ current_state: IDLE });
        btnCmpnt.stopTimer();
        if (resp.error === 0) {
            self.setSendingAmountInUI(0);
            self.inform("Sending Complete");
            return;
        } else if (resp.error === -1000) {
            self.warning("Invalid response for sending token");
        } else {
            self.warning(resp.data);
        }
    }

    onClickImportPassphrase = (ev) => {
        this.setState({ show_passphrase_import_dialog: true });
    }

    onCancelPassphraseImportDialog = () => {
        this.setState({ show_passphrase_import_dialog: false });
    }

    onOkPassphraseImportDialog = async (param) => {
        this.encryptedPassphrase = rsaCrypt.encrypt(param.passphrase);
        console.log("************* onOkPassphraseImportDialog(): param=", param);
        this.setState({ show_passphrase_import_dialog: false });
        let resp = await accountService.restoreAccount({
            userToken: this.userToken,
            password: hashCode(param.password),
            passphrase: self.encryptedPassphrase
        });
        if (resp.error === 0) {
            console.log("************* restoreAccount(): response=", resp);
            self.setState({ locked: false });
            self.setState({ accounts: resp.data });
            self.warning('');
            self.setState({ user_mode: USER_WITH_ACCOUNT });
            return;
        } else if (resp.error === -1000) {
            self.warning("Invalid response for creating account");
            return;
        }
        self.warning(resp.data);
    }

    openPasscodeConfirmDialog = (param, ev, btnCmpnt) => {
        this.tempStorage = {param: param, ev: ev, btnCmpnt: btnCmpnt};
        this.setState({ show_passcode_confirm_dialog: true });
    }

    onOkPasscodeConfirmDialog = (userPasswordToConfirmTx) => {
        this.setState({ show_passcode_confirm_dialog: false });
        this.userPasswordToConfirmTx = userPasswordToConfirmTx;
        let { param, ev, btnCmpnt } = this.tempStorage;
        this.tempStorage = {};
        this._transfer(param, ev, btnCmpnt);
    }

    onCancelPasscodeConfirmDialog = () => {
        let { param, ev, btnCmpnt } = this.tempStorage;
        this.tempStorage = {};
        btnCmpnt.stopTimer();
    }

    onLeaveFromPasswordInput = event => {
        this.setState({ hide_password_checklist: true });
    }

    onGeneratePassphrase = ev => {
        let randomWordList = randomWords(24).join(' ');
        let input = this.state.input;
        input.passphrase = randomWordList;
        this.setState({ input: input });
        this.encryptedPassphrase = rsaCrypt.encrypt(randomWordList);
    }

    render() {
        return (
            <>
                <div className="my-account-page">
                    <div className={!this.state.locked ? 'shownBox' : 'hiddenBox'}>
                        <div className="account-global-info-container">
                            <div className="lock-account-button-container mr-20">
                                {/* Lock Button */}
                                <DelayButton
                                    captionInDelay="Locking"
                                    caption="Lock"
                                    maxDelayInterval={30}
                                    onClickButton={this.onLockAccont}
                                    onClickButtonParam={null} />
                            </div>
                            <div id="my-account-info-container" className="account-info-container help-block main-font font-16 mr-16">
                                <p className="account-address-box help-block main-font text-green-400 font-16">
                                    {this.state.accounts ?
                                        this.state.accounts['ETH'] ?
                                            this.state.accounts['ETH'] ?
                                                this.state.accounts['ETH'] :
                                                null :
                                            null :
                                        null}
                                </p>
                                Balance:
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    {this.state.balance['ETH']} ETH
                                </p>
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    {this.state.balance['UNI']} UNI
                                </p>
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    {this.state.balance['DAI']} DAI
                                </p>
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    {this.state.balance['OCAT']} OCAT
                                </p>
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    {this.state.balance['PNFT']} PNFT
                                </p>

                                Prices:
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    ETH: ${this.state.price['ETH']}
                                </p>
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    UNI: ${this.state.price['UNI']}
                                </p>
                                <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                    DAI: ${this.state.price['DAI']}
                                </p>
                            </div>
                        </div>
                        <div className="pagetabbar-container mb-10">
                            <PageTabBar
                                key="transfer-tab"
                                onClickItem={this.onSelectTab}
                                items={walletPageTabItems}
                                defaultActiveItem='transfer-tab'
                            />
                        </div>
                        <div className={this.state.current_tab === 'transfer-tab' ? 'shownBox' : 'hiddenBox'}>
                            <div id="qr-account-container">
                                <div id="qr-container">
                                    <QRCode value="hey" />
                                </div>
                                <div id="account-info-container">
                                    <input
                                        type="text"
                                        className="block border border-grey-light bg-gray-100  w-full p-5 my-5 font-16 main-font focus:outline-none rounded mb-10"
                                        name="to_address"
                                        id="to_address"
                                        placeholder="To Address"
                                        value={this.state.input.to_address}
                                        onChange={this.handleInputChange}
                                        autoComplete="off" />
                                    <input
                                        type="number"
                                        className="block border border-grey-light bg-gray-100  w-full p-5 my-5 font-16 main-font focus:outline-none rounded mb-10"
                                        name="amount"
                                        id="amount"
                                        placeholder="Amount"
                                        value={this.state.input.amount}
                                        onChange={this.handleInputChange}
                                        autoComplete="off" />
                                </div>
                            </div>
                            <div id="send-button-container">
                                {/* Send Button */}
                                <DelayButton
                                    captionInDelay="Sending"
                                    caption="Send"
                                    maxDelayInterval={30}
                                    onClickButton={this.onTransfer}
                                    onClickButtonParam={null} />
                            </div>
                        </div>
                        <div className={this.state.current_tab === 'swap-tab' ? 'shownBox' : 'hiddenBox'}>
                            <div className="flex w-full justify-center">
                                <ExchangeSwap
                                    extraClass="home-card py-10 px-0 w-half h-full"
                                    inform={this.inform}
                                    warning={this.warning}
                                    userToken={this.userToken}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className='w-1/2'>
                    <SelectDropdown />
                </div> */}
            </>
        );
    }

}

export default WalletPage;