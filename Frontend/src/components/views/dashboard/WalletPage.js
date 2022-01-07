import React, { Component } from 'react';
import DelayButton from '../../common/DelayButton';
import PasswordChecklistComponent from "../../common/PasswordChecklistComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import {
    createAccount,
    connectAccount,
    getBalance,
    sendCryptoCurrency,
    lockAccount, unlockAccount
} from '../../../service/Account';
import { hashCode } from "../../../service/Utils";
import QRCode from "react-qr-code";
import {
    BATCHED_VALIDATION,
    INDIVIDUAL_VALIDATION,
    NOTIFY_WARNING,
    BALANCE_CHECKING_INTERVAL
} from "../../../Contants";

const eye = <FontAwesomeIcon icon={faEye} />;

const MAX_CREATING_DELAY_TIMEOUT = 10
const UNKNOWN_USER = 0;
const NEW_USER = 1;
const USER_WITH_ACCOUNT = 2;

var self;

class WalletPage extends Component {

    constructor(props) {
        super(props);
        self = this;

        this.state = {
            is_creating: false,
            user_mode: UNKNOWN_USER,
            creating_interval: MAX_CREATING_DELAY_TIMEOUT,
            balance: {
                eth: 0,
                btc: 0,
            },
            input: {
                to_address: '0xADB366C070DFB857DC63ebF797EFE615B0567C1B',
            },
            errors: {
                password: "",
                confirm_password: "",
                balance: "",
                amount: 0,
                account: ""
            },
            info: {
                send: "",
                account: "",
                balance: ""
            },
            accounts: {},
            locked: true,
            password: "",
            confirm_password: "",
            showPassword: false,
            hidePasswordCheckList: true,
            loading: false
        }

        this.userToken = null;
        this.validate = this.validate.bind(this)
        this.onCreateAccont = this.onCreateAccont.bind(this);
        this.onSend = this.onSend.bind(this);
        this.onLeaveFromPasswordInput = this.onLeaveFromPasswordInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.togglePasswordVisiblity = this.togglePasswordVisiblity.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.showMessageForSending = this.showMessageForSending.bind(this);
        this.showMessageForAccount = this.showMessageForAccount.bind(this);
        this.showMessageForBalance = this.showMessageForBalance.bind(this);
        this.setSendingAmountInUI = this.setSendingAmountInUI.bind(this);
        this.setBalanceInUI = this.setBalanceInUI.bind(this);
        this.setPasswordInUI = this.setPasswordInUI.bind(this);
        this.onUnlockAccont = this.onUnlockAccont.bind(this);
        this.onLockAccont = this.onLockAccont.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    componentDidMount() {
        this.userToken = localStorage.getItem("userToken");
        setInterval(function () {
            getBalance({
                reqParam: {
                    userToken: self.userToken
                },
                onComplete: resp => {
                    console.log("WalletPage::componentDidMount(): response: ", resp);
                    var errorMsg = null;
                    if (resp.error === 0) {
                        self.setBalanceInUI('eth', (resp.data - 0).toFixed(4));
                        return;
                    } else if (resp.error === -100) {
                        errorMsg = "No response for get balance";
                    } else if (resp.error !== 0) {
                        errorMsg = resp.data
                    }
                    self.showMessageForBalance(errorMsg);
                },
                onFailed: error => {
                    self.showMessageForBalance(error);
                }
            });
        },
        BALANCE_CHECKING_INTERVAL);
        // Try to connect to my account
        connectAccount({
            reqParam: {
                userToken: self.userToken
            },
            onComplete: resp => {
                var errorMsg = null;
                if (resp.error !== undefined) {
                    switch (resp.error) {
                        case 0:
                            self.setState({ accounts: resp.data });
                            self.setState({ user_mode: USER_WITH_ACCOUNT })
                            return;
                        case 1:
                            self.setState({ user_mode: NEW_USER })
                            return;
                        case -100:
                            errorMsg = "No response for get balance";
                            break;
                        default:
                            errorMsg = resp.data
                            break;
                    }
                } else {
                    errorMsg = "Invalid response for connecting to my account"
                }
                self.showMessageForAccount(errorMsg);
            },
            onFailed: error => {
                self.showMessageForAccount(error);
            }
        });
    }

    togglePasswordVisiblity = event => {
        // let password = event.target.parentNode.parentNode.parentNode.firstElementChild.value;
        this.setState({ showPassword: !this.state.showPassword });
    }

    validate = (fieldName = null) => {
        let validationMode = BATCHED_VALIDATION;
        if (fieldName !== null && fieldName !== "") {
            validationMode = INDIVIDUAL_VALIDATION;
        }
        // let input = this.state.input;
        let errors = {
            password: this.state.errors.password,
            confirm_password: this.state.errors.confirm_password,
            register_result: this.state.errors.register_result,
        };
        this.setState({ errors: errors });

        let isValid = true;

        this.setState({
            errors: errors
        });

        if (validationMode === INDIVIDUAL_VALIDATION) {
            isValid = false;
        }
        return isValid;
    }

    // fieldStateChanged = field => state => this.setState({ [field]: state.errors.length === 0 });
    validatePassword = (password) => {
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
        return 0;
    }


    handleInputChange = event => {
        let input = this.state.input;
        input[event.target.name] = event.target.value;
        this.setState({
            input
        });
        if (event.target.name === 'password') {
            this.setState({ hidePasswordCheckList: false });
            let password = input['password'] || "";
            if (password === null) {
                password = "";
            }
        }
        this.validate(event.target.name);
    }

    // type - 0: warning, 1: notification
    showMessageForSending = (msg, type = 0) => {
        let errorMsg = '', informMsg = '';
        if (typeof msg === 'object') {
            return;
        }
        if (type === 0) {
            errorMsg = msg;
            let errorsObj = this.state.errors;
            errorsObj.send = errorMsg;
            this.setState({ errors: errorsObj });
        } else if (type === 1) {
            informMsg = msg;
            let infoObj = this.state.info;
            infoObj.send = informMsg;
            this.setState({ info: infoObj });
        }
    }

    // type - 0: warning, 1: notification
    showMessageForAccount = (msg, type = 0) => {
        let errorMsg = '', informMsg = '';
        if (typeof msg === 'object') {
            return;
        }
        if (type === 0) {
            errorMsg = msg;
            let errorsObj = this.state.errors;
            errorsObj.account = errorMsg;
            this.setState({ errors: errorsObj });
        } else if (type === 1) {
            informMsg = msg;
            let infoObj = this.state.info;
            infoObj.account = informMsg;
            this.setState({ info: infoObj });
        }
    }

    // type - 0: warning, 1: notification
    showMessageForBalance = (msg, type = 0) => {
        let errorMsg = '', informMsg = '';
        if (typeof msg === 'object') {
            return;
        }
        if (type === 0) {
            errorMsg = msg;
            let errorsObj = this.state.errors;
            errorsObj.balance = errorMsg;
            this.setState({ errors: errorsObj });
        } else if (type === 1) {
            informMsg = msg;
            let infoObj = this.state.info;
            infoObj.balance = informMsg;
            this.setState({ info: infoObj });
        }
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

    setPasswordInUI = password => {
        let input = this.state.input;
        input.password = password;
        this.setState({ input: input });
    }

    onCreateAccont = (param, ev, buttonCmpnt) => {
        if (!this.validate()) {
            return;
        }
        // Perform additional validation for email-phone
        // If required action performed, buttonCmpnt.stopTimer() must be called to stop loading
        if (this.userToken === null) {
            this.showMessageForAccount("Error: user token invalid(null)");
            return;
        }
        createAccount({
            reqParam: {
                userToken: this.userToken,
                password: hashCode(this.state.input.password),
            },
            onComplete: resp => {
                buttonCmpnt.stopTimer();
                if (resp.error == 0) {
                    self.setState({ accounts: resp.data });
                    self.setState({ user_mode: USER_WITH_ACCOUNT });
                    return;
                } else if (resp.error == -100) {
                    self.showMessageForAccount("Invalid response for creating account");
                    return;
                }
                self.showMessageForAccount(resp.data);
            },
            onFailed: error => {
                buttonCmpnt.stopTimer();
                this.showMessageForAccount(error);
            }
        });
    }

    onSend = (param, ev, buttonCmpnt) => {
        let toAddress = this.state.input ? this.state.input.to_address ? this.state.input.to_address : null : null;
        if (toAddress === null) {
            buttonCmpnt.stopTimer();
            this.showMessageForSending("Please input receiving address");
            return;
        }
        if (toAddress.trim().length !== 42) {
            buttonCmpnt.stopTimer();
            this.showMessageForSending("Please input valid receiving address");
            return;
        }

        let amount = this.state.input ? this.state.input.amount ? this.state.input.amount : null : null;
        if (amount === null || amount.trim() === "") {
            buttonCmpnt.stopTimer();
            this.showMessageForSending("Please input the amount to send");
            return;
        }

        sendCryptoCurrency({
            reqParam: {
                userToken: this.userToken,
                toAddress: toAddress,
                amount: amount,
            },
            onComplete: resp => {
                buttonCmpnt.stopTimer();

                if (resp.error == 0) {
                    self.setSendingAmountInUI(0);
                    self.showMessageForSending("Sending Complete", 1);
                    return;
                } else if (resp.error == -100) {
                    self.showMessageForSending("Invalid response for sending token");
                } else {
                    self.showMessageForSending(resp.data);
                }
            },
            onFailed: error => {
                buttonCmpnt.stopTimer();
                self.showMessageForSending(error);
            }
        });
    }

    onLeaveFromPasswordInput = event => {
        this.setState({ hidePasswordCheckList: true });
    }

    onLockAccont = (param, ev, buttonCmpnt) => {
        // Try to unlock
        lockAccount({
            reqParam: {
                userToken: this.userToken,
            },
            onComplete: resp => {
                buttonCmpnt.stopTimer();
                if (resp.error == 0) {
                    // Display unlocked account page
                    self.setState({ locked: true });
                    return;
                } else if (resp.error == -100) {
                    self.showMessageForAccount("Invalid response for locking account");
                    return;
                }
                self.showMessageForAccount(resp.data);
            },
            onFailed: error => {
                buttonCmpnt.stopTimer();
                self.showMessageForAccount(error);
            }
        });
    }

    onUnlockAccont = (param, ev, buttonCmpnt) => {
        // Try to unlock
        unlockAccount({
            reqParam: {
                userToken: this.userToken,
                password: hashCode(this.state.input.password),
            },
            onComplete: resp => {
                buttonCmpnt.stopTimer();
                if (resp.error == 0) {
                    // Display unlocked account page
                    self.setPasswordInUI('');
                    self.setState({ locked: false });
                    return;
                } else if (resp.error == -100) {
                    self.showMessageForAccount("Invalid response for locking account");
                    return;
                }
                self.showMessageForAccount(resp.data);
            },
            onFailed: error => {
                buttonCmpnt.stopTimer();
                self.showMessageForAccount(error);
            }
        });
    }

    render() {
        return (
            <div className="my-account-page">
                <p className="account-balance-box main-font text-red-400 mb-100 font-14">{this.state.errors.balance}</p>
                <p className="help-block main-font text-red-400 font-16">{this.state.errors.account}</p>
                <p className="help-block main-font text-green-400 font-16">{this.state.info.account}</p>
                <div className={this.state.user_mode === USER_WITH_ACCOUNT ? 'shownBox' : 'hiddenBox'}>
                    <div className={!this.state.locked ? 'shownBox' : 'hiddenBox'}>
                        <div id="my-account-info-container" className="account-info-container help-block main-font font-16 mr-16">
                            <p className="account-address-box help-block main-font text-green-400 font-16">
                                {
                                    this.state.accounts ?
                                    this.state.accounts.eth ?
                                        this.state.accounts.eth.address ?
                                            this.state.accounts.eth.address :
                                            null :
                                        null :
                                    null
                                }
                            </p>
                            <div class="lock-account-button-container">
                                {/* Lock Button */}
                                <DelayButton
                                    captionInDelay="Locking"
                                    caption="Lock"
                                    maxDelayInterval={30}
                                    onClickButton={this.onLockAccont}
                                    onClickButtonParam={null}
                                />
                            </div>
                            <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                                Balance: {this.state.balance.eth} ETH
                            </p>
                        </div>
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
                                onClickButton={this.onSend}
                                onClickButtonParam={null}
                            />
                        </div>
                    </div>
                    <div className={this.state.locked ? 'shownBox' : 'hiddenBox'}>
                        <div className="mb-10">
                            <div className="password-container block w-full">
                                <input
                                    type={this.state.showPassword ? "text" : "password"}
                                    className="password-input border border-grey-light bg-gray-100 w-full p-5 font-16 main-font focus:outline-none rounded "
                                    name="password"
                                    value={this.state.input.password}
                                    onChange={this.handleInputChange}
                                    onBlur={this.onLeaveFromPasswordInput}
                                    placeholder="Password" autoComplete="off"
                                />
                                <i className="ShowPasswordIcon font-16" onClick={this.togglePasswordVisiblity}>{eye}</i>
                            </div>
                            <span className="help-block main-font text-red-400 font-14">{this.state.errors.password}</span>
                            <div id="unlock-account-button-container">
                                {/* Send Button */}
                                <DelayButton
                                    captionInDelay="Unlocking"
                                    caption="Unlock"
                                    maxDelayInterval={30}
                                    onClickButton={this.onUnlockAccont}
                                    onClickButtonParam={null}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={this.state.user_mode === NEW_USER ? 'shownBox' : 'hiddenBox'}>
                    <div className="mb-10">
                        <div className="password-container block w-full">
                            <input
                                type={this.state.showPassword ? "text" : "password"}
                                className="password-input border border-grey-light bg-gray-100 w-full p-5 font-16 main-font focus:outline-none rounded "
                                name="password"
                                value={this.state.input.password}
                                onChange={this.handleInputChange}
                                onBlur={this.onLeaveFromPasswordInput}
                                placeholder="Password" autoComplete="off"
                            />
                            <i className="ShowPasswordIcon font-16" onClick={this.togglePasswordVisiblity}>{eye}</i>
                        </div>
                        <span className="help-block main-font text-red-400 font-14">{this.state.errors.password}</span>
                    </div>
                    <PasswordChecklistComponent
                        password={this.state.input['password'] || ""}
                        confirmPassword={this.state.input['confirm_password'] || ""}
                        hidden={this.state.hidePasswordCheckList}
                    />
                    <div className="mb-10">
                        <input
                            type="password"
                            className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                            name="confirm_password"
                            id="confirm_password"
                            value={this.state.input.confirm_password}
                            onChange={this.handleInputChange}
                            placeholder="Confirm Password" autoComplete="off"
                        />
                        <span className="help-block main-font text-red-400 font-14">{this.state.errors.confirm_password}</span>
                    </div>
                    <div id="create-account-button-container">
                        {/* Send Button */}
                        <DelayButton
                            captionInDelay="New Account"
                            caption="New Account"
                            maxDelayInterval={30}
                            onClickButton={this.onCreateAccont}
                            onClickButtonParam={null}
                        />
                    </div>
                    <span className="help-block main-font text-red-400 font-16">{this.state.errors.send}</span>
                    <span className="help-block main-font text-green-400 font-16">{this.state.info.send}</span>
                </div>
            </div>
        );
    }

}

export default WalletPage;


