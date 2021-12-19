import React, { Component } from 'react';
import DelayButton from '../../common/DelayButton';
import PasswordChecklistComponent from "../../common/PasswordChecklistComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { createAccount } from '../../../service/Wallet'
import { useParams } from 'react-router-dom';
import {
    BATCHED_VALIDATION,
    INDIVIDUAL_VALIDATION,
    NOTIFY_WARNING,
    NOTIFY_INFORMATION,
  } from "../../../Contants";

const eye = <FontAwesomeIcon icon={faEye} />;

const MAX_CREATING_DELAY_TIMEOUT = 10

var me;

class WalletPage extends Component {

    constructor(props) {
        super(props);
        me = this;

        this.state = {
            is_creating: false,
            creating_interval: MAX_CREATING_DELAY_TIMEOUT,
            address: {
                eth: 0,
                btc: 0,
            },
            input: {},
            errors: {
                password: "",
                confirm_password: ""
            },
            password: "",
            confirm_password: "",
            showPassword: false,
            hidePasswordCheckList: true,
            loading: false
        }

        this.validate = this.validate.bind(this)
        this.onCreateAccont = this.onCreateAccont.bind(this);
        this.onLeaveFromPasswordInput = this.onLeaveFromPasswordInput.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.togglePasswordVisiblity = this.togglePasswordVisiblity.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
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
        let input = this.state.input;
        let errors = {
            password: this.state.errors.password,
            confirm_password: this.state.errors.confirm_password,
            register_result: this.state.errors.register_result,
        };
        this.setState({ errors: errors });

        let isValid = true;

        // Validate password
        while (1) {
            if (validationMode === INDIVIDUAL_VALIDATION && fieldName !== 'password')
                break;

            errors.password = "";
            errors.register_result = "";

            let value = input["password"] || null;
            if (!value) {
                isValid = false;
                errors["password"] = "Please enter your password.";
            }
            if (typeof value !== "undefined") {
                if (value) {
                    if (value.length < this.thresholdLength) {
                        isValid = false;
                        errors["password"] = "Please add at least 8 charachter.";
                    } else {
                        let passwordStrength = this.validatePassword(value);
                        if (passwordStrength < 0) {
                            switch (passwordStrength) {
                                case -1:
                                    errors["password"] = "The password must contain at least 1 lowercase alphabetical character";
                                    break;
                                case -2:
                                    errors["password"] = "The password must contain at least 1 uppercase alphabetical character";
                                    break;
                                case -3:
                                    errors["password"] = "The password must contain at least 1 numeric character";
                                    break;
                                case -4:
                                    errors["password"] = "The password must contain at least one special character";
                                    break;
                                case -5:
                                    errors["password"] = "The password must be eight characters or longer";
                                    break;
                                default:
                                    break;
                            }
                            isValid = false;
                        }
                    }
                }
            }
            break;
        }
        // Validate confirm password
        while (1) {
            if (validationMode === INDIVIDUAL_VALIDATION && fieldName !== 'confirm_password')
                break;

            errors.confirm_password = "";
            errors.register_result = "";

            if (!input["confirm_password"]) {
                isValid = false;
                errors["confirm_password"] = "Please enter your confirm password.";
            }

            if (typeof input["password"] !== "undefined" && typeof input["confirm_password"] !== "undefined") {
                if (input["password"] !== input["confirm_password"]) {
                    isValid = false;
                    errors["confirm_password"] = "Passwords don't match.";
                }
            }
            break;
        }

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

    onLeaveFromPasswordInput = event => {
        this.setState({ hidePasswordCheckList: true });
    }


    render() {
        return (
            <div className="my-wallet-page">
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

                <div>
                    {/* Create Account Button */}
                    <DelayButton
                        captionInDelay="Creating"
                        caption="Creat Account"
                        maxDelayInterval={30}
                        onClickButton={this.onCreateAccont}
                        onClickButtonParam={null}
                    />
                </div>
                <span className="account-address-box main-font text-red-400 font-14">Balance: {this.state.address.eth}</span>
                <div>

                </div>
            </div>
        );
    }

}

export default WalletPage;


