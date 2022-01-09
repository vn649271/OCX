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

const   IDLE = 0,
        LOCKING = 1,
        SENDING = 2;

var self;

class WalletPage extends Component {

    constructor(props) {
        super(props);
        self = this;

        this.state = {
            is_creating: false,
            user_mode: UNKNOWN_USER,
            creating_interval: MAX_CREATING_DELAY_TIMEOUT,
            current_state: IDLE,
            balance: {
                eth: 0,
                btc: 0,
            },
            input: {
                to_address: '0xADB366C070DFB857DC63ebF797EFE615B0567C1B',
            },
            error: "",
            info: "",
            accounts: {},
            locked: true,
            password: "",
            confirm_password: "",
            showPassword: false,
            hidePasswordCheckList: true,
            loading: false
        }

        this.userToken = null;
        this.balanceTimer = null;
        this.onCreateAccont = this.onCreateAccont.bind(this);
        this.onSend = this.onSend.bind(this);
        this.onLeaveFromPasswordInput = this.onLeaveFromPasswordInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.togglePasswordVisiblity = this.togglePasswordVisiblity.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.inform = this.inform.bind(this);
        this.warning = this.warning.bind(this);
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
        this.balanceTimer = setInterval(function () {
            getBalance({
                reqParam: {
                    userToken: self.userToken
                },
                onComplete: resp => {
                    var errorMsg = null;
                    if (resp.error === 0) {
                        self.setBalanceInUI('eth', (resp.data - 0).toFixed(4));
                        return;
                    } else if (resp.error === -100) {
                        errorMsg = "No response for get balance";
                    } else if (resp.error !== 0) {
                        errorMsg = resp.data
                    }
                    self.warning(errorMsg);
                },
                onFailed: error => {
                    self.warning(error);
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
                            self.setState({ accounts: resp.data.addresses });
                            self.setState({ user_mode: USER_WITH_ACCOUNT })
                            self.setState({ locked: resp.data.locked });
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
                self.warning(errorMsg);
            },
            onFailed: error => {
                self.warning(error);
            }
        });
    }

    componentWillUnmount() {
        if (this.balanceTimer) {
            clearInterval(this.balanceTimer);
            this.balanceTimer = null;
        }
    }

    togglePasswordVisiblity = event => {
        // let password = event.target.parentNode.parentNode.parentNode.firstElementChild.value;
        this.setState({ showPassword: !this.state.showPassword });
    }

    handleInputChange = event => {
        this.warning('');
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
        } else if (event.target.name === 'confirm_password') {
            let password = input['password'];
            let confirmPassword = input['confirm_password'];
            if (confirmPassword !== password) {
                this.warning('Password mismatch');
            }
        }
    }

    inform = (msg) => {
        console.log("-------------------inform(): ", msg);
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

    onCreateAccont = (param, ev, buttonCmpnt) => {
        let passwordValidation = this.validatePassword(
            this.state.input.password, 
            this.state.input.confirm_password
        );
        if (passwordValidation < 0) {
            this.warning("Invalid password");
            return;
        }
        // Perform additional validation for email-phone
        // If required action performed, buttonCmpnt.stopTimer() must be called to stop loading
        if (this.userToken === null) {
            this.warning("Error: user token invalid(null)");
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
                    self.setState({ locked: false });
                    let accounts = this.state.accounts;
                    accounts.eth = resp.data;
                    self.setState({ accounts: accounts });
                    self.warning('');
                    self.setState({ user_mode: USER_WITH_ACCOUNT });
                    return;
                } else if (resp.error == -100) {
                    self.warning("Invalid response for creating account");
                    return;
                }
                self.warning(resp.data);
            },
            onFailed: error => {
                buttonCmpnt.stopTimer();
                this.warning(error);
            }
        });
    }

    onLockAccont = (param, ev, buttonCmpnt) => {
        this.warning('');
        if (this.state.current_state !== IDLE) {
            buttonCmpnt.stopTimer();
            this.warning('Could not perform the current action during another one');
            return;
        }
        // Try to unlock
        this.setState({ current_state: LOCKING });
        lockAccount({
            reqParam: {
                userToken: this.userToken,
            },
            onComplete: resp => {
                this.setState({ current_state: IDLE });
                buttonCmpnt.stopTimer();
                this.warning('');
                if (resp.error == 0) {
                    // Display unlocked account page
                    self.setState({ locked: true });
                    return;
                } else if (resp.error == -100) {
                    self.warning("Invalid response for locking account");
                    return;
                }
                self.warning(resp.data);
            },
            onFailed: error => {
                this.setState({ current_state: IDLE });
                buttonCmpnt.stopTimer();
                self.warning(error);
            }
        });
    }

    onUnlockAccont = (param, ev, buttonCmpnt) => {
        this.warning('');
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
                    self.warning('');
                    self.setPasswordInUI('');
                    self.setState({ locked: false });
                    return;
                } else if (resp.error == -100) {
                    self.warning("Invalid response for locking account");
                    return;
                }
                self.warning(resp.data);
            },
            onFailed: error => {
                this.setState({ current_state: IDLE });
                buttonCmpnt.stopTimer();
                self.warning(error);
            }
        });
    }

    onSend = (param, ev, buttonCmpnt) => {
        this.warning('');
        if (this.state.current_state !== IDLE) {
            buttonCmpnt.stopTimer();
            this.warning('Could not perform the current action during another one');
            return;
        }
        let toAddress = this.state.input ? this.state.input.to_address ? this.state.input.to_address : null : null;
        if (toAddress === null) {
            buttonCmpnt.stopTimer();
            this.warning("Please input receiving address");
            return;
        }
        if (toAddress.trim().length !== 42) {
            buttonCmpnt.stopTimer();
            this.warning("Please input valid receiving address");
            return;
        }

        let amount = this.state.input ? this.state.input.amount ? this.state.input.amount : null : null;
        if (amount === null || amount.trim() === "") {
            buttonCmpnt.stopTimer();
            this.warning("Please input the amount to send");
            return;
        }

        this.setState({ current_state: SENDING });

        sendCryptoCurrency({
            reqParam: {
                userToken: this.userToken,
                toAddress: toAddress,
                amount: amount,
            },
            onComplete: resp => {
                this.setState({ current_state: IDLE });
                buttonCmpnt.stopTimer();
                if (resp.error == 0) {
                    self.setSendingAmountInUI(0);
                    self.inform("Sending Complete");
                    return;
                } else if (resp.error == -100) {
                    self.warning("Invalid response for sending token");
                } else {
                    self.warning(resp.data);
                }
            },
            onFailed: error => {
                this.setState({ current_state: IDLE });
                buttonCmpnt.stopTimer();
                self.warning(error);
            }
        });
    }

    onLeaveFromPasswordInput = event => {
        this.setState({ hidePasswordCheckList: true });
    }

    render() {
        return (
            <div className="my-account-page">
                <p className="account-balance-box main-font text-red-400 mb-100 font-16">{this.state.error}</p>
                <p className="help-block main-font text-green-400 font-16">{this.state.info }</p>
                <div className={this.state.user_mode === USER_WITH_ACCOUNT ? 'shownBox' : 'hiddenBox'}>
                    <div className={!this.state.locked ? 'shownBox' : 'hiddenBox'}>
                        <div id="my-account-info-container" className="account-info-container help-block main-font font-16 mr-16">
                            <p className="account-address-box help-block main-font text-green-400 font-16">
                                {
                                    this.state.accounts ?
                                    this.state.accounts.eth ?
                                        this.state.accounts.eth ?
                                            this.state.accounts.eth :
                                            null :
                                        null :
                                    null
                                }
                            </p>
                            <div className="lock-account-button-container">
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
                            <div className="account-password-container block w-full">
                                <input
                                    type={this.state.showPassword ? "text" : "password"}
                                    className="password-input border border-grey-light bg-gray-100 p-5 width-50 font-16 main-font focus:outline-none rounded "
                                    name="password"
                                    value={this.state.input.password}
                                    onChange={this.handleInputChange}
                                    onBlur={this.onLeaveFromPasswordInput}
                                    placeholder="Password" autoComplete="off"
                                />
                                <i className="ShowPasswordIcon font-16" onClick={this.togglePasswordVisiblity}>{eye}</i>
                            </div>
                            <div id="unlock-account-button-container">
                                {/* Unlock Button */}
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
                        <div className="account-password-container block w-full">
                            <input
                                type={this.state.showPassword ? "text" : "password"}
                                className="password-input border border-grey-light bg-gray-100 p-5 font-16 main-font focus:outline-none rounded "
                                name="password"
                                value={this.state.input.password}
                                onChange={this.handleInputChange}
                                onBlur={this.onLeaveFromPasswordInput}
                                placeholder="Password" autoComplete="off"
                            />
                            <i className="ShowPasswordIcon font-16" onClick={this.togglePasswordVisiblity}>{eye}</i>
                        </div>
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
                </div>
            </div>
        );
    }

}

export default WalletPage;


