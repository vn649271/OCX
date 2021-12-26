import React, { Component } from 'react';
import DelayButton from '../../common/DelayButton';
// import PasswordChecklistComponent from "../../common/PasswordChecklistComponent";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye } from "@fortawesome/free-solid-svg-icons";
import { createAccount, getBalance, sendCryptoCurrency } from '../../../service/Wallet'
import QRCode from "react-qr-code";
// import { useParams } from 'react-router-dom';
import {
    BATCHED_VALIDATION,
    INDIVIDUAL_VALIDATION,
    NOTIFY_WARNING,
    // NOTIFY_INFORMATION,
} from "../../../Contants";

// const eye = <FontAwesomeIcon icon={faEye} />;

const MAX_CREATING_DELAY_TIMEOUT = 10

var me;

class WalletPage extends Component {

    constructor(props) {
        super(props);
        me = this;

        this.state = {
            is_creating: false,
            creating_interval: MAX_CREATING_DELAY_TIMEOUT,
            balance: {
                eth: 0,
                btc: 0,
            },
            input: {
                to_address: '0xADB366C070DFB857DC63ebF797EFE615B0567C1B'
            },
            errors: {
                password: "",
                confirm_password: "",
                balance: "",
                amount: 0,
            },
            info: {
                send: ''
            },
            password: "",
            confirm_password: "",
            showPassword: false,
            hidePasswordCheckList: true,
            loading: false
        }

        this.validate = this.validate.bind(this)
        this.onCreateAccont = this.onCreateAccont.bind(this);
        this.onSend = this.onSend.bind(this);
        this.onLeaveFromPasswordInput = this.onLeaveFromPasswordInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.togglePasswordVisiblity = this.togglePasswordVisiblity.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
		this.showMessageForSending = this.showMessageForSending.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    componentDidMount() {
        console.log("componentDidMount()");
        setInterval(function() {
            getBalance({
                userToken: "xxxxxxxxxxxxxxx",
                account: "yyyyyyyyyyyyyyyyyyyyy",
                onComplete: function(resp) {
                    console.log("getBalance: ", resp);
                    let error = resp ? resp.error ? resp.error : null : null;
                    if (error === null) {
                        let balance = resp ? resp.data ? resp.data : null : null;
                        if (balance !== null) {
                            let balanceObj = me.state.balance;
                            balanceObj.eth = ((balance - 0) / 1000000000000000000).toFixed(4);
                            me.setState({balance: balanceObj});
                            return;
                        }
                    }
                    let errorsObj = me.state.errors;
                    errorsObj.balance = resp.data;
                    me.setState({ errors: errorsObj });
                }
            });
        }, 
        10000);
    }

    togglePasswordVisiblity = event => {
        console.log("togglePasswordVisiblity()", event.target.value);
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
        console.log("handleInputChange(): src: ", event.target.name, "    content: ", event.target.value);

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

    showWarningForPassword = (msg, type = NOTIFY_WARNING) => {
        let errors = this.state.errors;
        errors.password = msg;
        this.setState({
            errors: errors
        });
    }

    onCreateAccont = (param, ev, buttonCmpnt) => {
        if (!this.validate()) {
            return;
        }
        // Perform additional validation for email-phone
        // If required action performed, buttonCmpnt.stopTimer() must be called to stop loading
        createAccount({
            userToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
            password: this.state.input.password,
            onComplete: function (resp) {
                buttonCmpnt.stopTimer();
                console.log("WalletPage.onCreateAccont():  ", resp);
            },
            onFailed: function (error) {
                buttonCmpnt.stopTimer();
                console.log("WalletPage.onCreateAccont():  ", error);
            }
        });
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

    onSend = (param, ev, buttonCmpnt) => {
        console.log("WalletPage.onSend()");
        let toAddress = this.state.input ? this.state.input.to_address ? this.state.input.to_address: null : null;
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

		let amount = this.state.input ? this.state.input.amount ? this.state.input.amount: null : null;
        if (amount === null || amount.trim() === "") {
            buttonCmpnt.stopTimer();
			this.showMessageForSending("Please input the amount to send");
            return;
        }

        sendCryptoCurrency({
            userToken: "xxxxxxxxxxxxxxx",
            toAddress: toAddress, // "0xADB366C070DFB857DC63ebF797EFE615B0567C1B",
            amount: amount,
            onComplete: function(resp) {
				buttonCmpnt.stopTimer();

				let input = me.state.input;
				input.amount = '';
				// input.to_address = '';
				me.setState({ input: input });

				me.showMessageForSending('');
                console.log("getBalance: ", resp);
                let error = resp ? resp.error ? resp.error : null : null;
                if (error === null) {
					me.showMessageForSending("Sending Complete", 1);
					return;
                }
                let errorData = resp ? resp.data ? resp.data : "" : "";
				me.showMessageForSending(errorData);
            },
			onFailed: function(error) {
                buttonCmpnt.stopTimer();
				console.log("?????????????????????????? ", error);
				me.showMessageForSending("Failed to send. For more details, see the console.");
			}
        });
    }

    onLeaveFromPasswordInput = event => {
        this.setState({ hidePasswordCheckList: true });
    }


    render() {
        return (
            <div className="my-wallet-page">
                <span className="account-balance-box main-font text-black-400 mb-100 font-20">Balance: {this.state.balance.eth} ETH</span>
                <span className="account-balance-box main-font text-red-400 font-14">{this.state.errors.balance}</span>
                <div>
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
                    <span className="help-block main-font text-red-400 font-16">{this.state.errors.send}</span>
                    <span className="help-block main-font text-green-400 font-16">{this.state.info.send}</span>
                </div>
            </div>
        );
    }

}

export default WalletPage;


