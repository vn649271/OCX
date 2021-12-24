import React, { Component } from "react";
import { Link } from "react-router-dom";
import { register, requestSmsCode, verifySmsCode, validatePhoneNumber } from "../../../service/UserAuth";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Alert from "../../common/Alert"
import signimg from '../../common/assets/images/img/main-img.png';
import RecaptchaComponent from "../../common/Recaptcha";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { GoogleLogin } from 'react-google-login';
import PasswordChecklistComponent from "../../common/PasswordChecklistComponent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import {
  GOOGLE_LOGIN_CLIENT_ID,
  BATCHED_VALIDATION,
  INDIVIDUAL_VALIDATION,
  NOTIFY_WARNING,
  NOTIFY_INFORMATION,
  MAX_SMS_DELAY_TIMEOUT
} from "../../../Contants";

const eye = <FontAwesomeIcon icon={faEye} />;

var me;

export default class Register extends Component {

  constructor(props) {
    super(props);
    me = this;

    const { minStrength = 3, thresholdLength = 7 } = props;

    this.minStrength = typeof minStrength === 'number'
      ? Math.max(Math.min(minStrength, 4), 0)
      : 3;

    this.thresholdLength = typeof thresholdLength === 'number'
      ? Math.max(thresholdLength, 7)
      : 7;

    this.state = {
      input: {},
      errors: {
        register_result: '',
        phone_for_email: '',
        password: ''
      },
      password_strength: 0,
      phone_for_gmail: '',
      phone_for_email: '',
      warning: {
        phone_for_gmail: ''
      },
      message: {
        phone_for_gmail: ''
      },
      disableGoogleButton: true,
      loading: false,
      loading_sms_verify_interval: MAX_SMS_DELAY_TIMEOUT,
      hidePasswordCheckList: true,
      showPassword: false
    }

    this.smsVerifyTimer = null;

    this.recaptchaComponent = new RecaptchaComponent();

    this.validate = this.validate.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitData = this.submitData.bind(this)
    this.responseGoogle = this.responseGoogle.bind(this)
    this.responseGoogleFailed = this.responseGoogleFailed.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.onPhone4EmailChange = this.onPhone4EmailChange.bind(this)
    this.onConnectionTimeout = this.onConnectionTimeout.bind(this)
    this.onRequestSmsCode = this.onRequestSmsCode.bind(this)
    this.showMessageForGmailPhone = this.showMessageForGmailPhone.bind(this)
    this.passwordValidate = this.passwordValidate.bind(this)
    this.togglePasswordVisiblity = this.togglePasswordVisiblity.bind(this)
    this.onLeaveFromPasswordInput = this.onLeaveFromPasswordInput.bind(this)
  }

  componentDidMount() {
    // document.getElementsByClassName('profile-dropdown-menu')[0].classList.add('hidden');
    /******************************************************************************************/
    /********************** Lock Google button disabled ***************************************/
    let googleButton = document.getElementsByClassName('google-signup-button')[0];
    googleButton.onclick = function (ev) {
      me.setState({
        warning: {
          google_login: ""
        }
      });
      me.googleButtonTimer = setTimeout(() => {
        me.setState({ disableGoogleButton: true });
      }, 100);
    }
    /******************************************************************************************/
  }

  // fieldStateChanged = field => state => this.setState({ [field]: state.errors.length === 0 });
  passwordValidate = (password) => {
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

  validate = (fieldName = null) => {
    let validationMode = BATCHED_VALIDATION;
    if (fieldName !== null && fieldName !== "") {
      validationMode = INDIVIDUAL_VALIDATION;
    }
    let input = this.state.input;
    let errors = {
      first_name: this.state.errors.first_name,
      last_name: this.state.errors.last_name,
      email: this.state.errors.email,
      phone_for_email: this.state.errors.phone_for_email,
      password: this.state.errors.password,
      confirm_password: this.state.errors.confirm_password,
      register_result: this.state.errors.register_result,
    };
    this.setState({ errors: errors });

    let isValid = true;

    // Validate first name
    while (1) {
      if (validationMode === INDIVIDUAL_VALIDATION && fieldName !== 'first_name')
        break;

      errors.first_name = "";
      errors.register_result = "";

      if (!input["first_name"]) {
        isValid = false;
        errors["first_name"] = "Please enter your first name.";
      }
      if (typeof input["first_name"] !== "undefined") {
        const re = /^\S*$/;
        if (input["first_name"].length < 1 || !re.test(input["first_name"])) {
          isValid = false;
          errors["first_name"] = "Please enter valid first name.";
        }
      }
      break;
    }
    // Validate last name
    while (1) {
      if (validationMode === INDIVIDUAL_VALIDATION && fieldName !== 'last_name')
        break;

      errors.last_name = "";
      errors.register_result = "";

      if (!input["last_name"]) {
        isValid = false;
        errors["last_name"] = "Please enter your last name.";
      }
      if (typeof input["last_name"] !== "undefined") {
        const re = /^\S*$/;
        if (input["last_name"].length < 1 || !re.test(input["last_name"])) {
          isValid = false;
          errors["last_name"] = "Please enter valid last name.";
        }
      }
      break;
    }
    // Validate Email
    while (1) {
      if (validationMode === INDIVIDUAL_VALIDATION && fieldName !== 'email')
        break;

      errors.email = "";
      errors.register_result = "";

      if (!input["email"]) {
        isValid = false;
        errors["email"] = "Please enter your email Address.";
      }
      if (typeof input["email"] !== "undefined") {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        if (!pattern.test(input["email"])) {
          isValid = false;
          errors["email"] = 'Please enter valid email address (like "v@gmail.com")';
        }
      }
      break;
    }
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
            let passwordStrength = this.passwordValidate(value);
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
    // Validate phone number format
    while (1) {
      if (validationMode === INDIVIDUAL_VALIDATION && fieldName !== 'phone_for_email')
        break;
      errors.phone_for_email = "";
      errors.register_result = "";

      if (!input["phone_for_email"]) {
        isValid = false;
        errors["phone_for_email"] = 'Please enter phone number';
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

  onConnectionTimeout = () => {
    this.setState({ loading: false });
    Alert("Connection timed out. Please check your internet connection");
  }

  onRequestSmsCode = ev => {
    console.log("Register.onRequestSmsCode()");
    if (this.state.loading && this.state.loading_sms_verify_interval > 0) {
      return;
    }

    if (this.state.input.phone_for_gmail === undefined ||
      this.state.input.phone_for_gmail === null ||
      this.state.input.phone_for_gmail === "") {
      this.showMessageForGmailPhone("Please input phone number");
      return;
    }
    this.showMessageForGmailPhone("");
    this.setState({ loading: true });

    /* Start counting for requesting SMS verify code */
    this.smsVerifyTimer = setInterval(
      function () {
        let smsVerifyInterval = me.state.loading_sms_verify_interval;
        smsVerifyInterval--;
        if (smsVerifyInterval <= 0) {
          me.setState({ loading: false });
          me.setState({ loading_sms_verify_interval: MAX_SMS_DELAY_TIMEOUT });
          clearTimeout(me.smsVerifyTimer);
        }
        me.setState({ loading_sms_verify_interval: smsVerifyInterval });
      },
      1000
    );

    /* Send request to validate phone number */
    validatePhoneNumber(this.state.input.phone_for_gmail, resp => {
      me.setState({ loading: false });
      if (!resp.error) {
        me.setState({ loading: true });
        /* Send verify code to the user Gmail */
        requestSmsCode(me.state.input.phone_for_gmail, resp => {
          me.setState({ loading: false });
          if (me.smsVerifyTimer) {
            clearTimeout(me.smsVerifyTimer);
            me.setState({ loading_sms_verify_interval: MAX_SMS_DELAY_TIMEOUT });
          }
          if (!resp.error) {
            me.showMessageForGmailPhone("Verification code was sent to your phone.\n" +
              "Please check code in your phone to verify", NOTIFY_INFORMATION);
          } else {
            me.showMessageForGmailPhone(resp.message)
          }
        })
      } else {
        if (me.smsVerifyTimer) {
          clearTimeout(me.smsVerifyTimer);
          me.setState({ loading_sms_verify_interval: MAX_SMS_DELAY_TIMEOUT });
        }
        me.showMessageForGmailPhone(resp.message);
      }
    });
  }

  togglePasswordVisiblity = event => {
    console.log("togglePasswordVisiblity()", event.target.value);
    this.setState({ showPassword: !this.state.showPassword });
  }

  onLeaveFromPasswordInput = event => {
    this.setState({ hidePasswordCheckList: true });
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
    } else if (event.target.name === 'sms_code_for_gmail') {
      // Perform phone verification
      if (this.state.input.phone_for_gmail && this.state.input.sms_code_for_gmail) {
        this.showMessageForGmailPhone("");
        this.setState({ loading: true });
        verifySmsCode(this.state.input.phone_for_gmail, this.state.input.sms_code_for_gmail, resp => {
          me.setState({ loading: false });
          /***************************************/
          /******** Enable Google button *********/
          if (me.state.disableGoogleButton) {
            me.setState({ disableGoogleButton: false });
          }
          if (resp !== undefined && resp !== null &&
            resp.error !== undefined && resp.error !== null && resp.error === 0 &&
            resp.message !== undefined && resp.message !== null) {
            me.state.phoneId = resp.message;
            me.showMessageForGmailPhone("Success to phone verfication", NOTIFY_INFORMATION);
          } else {
            me.showMessageForGmailPhone((resp.message ? resp.message : "Failed to phone verfication"));
          }
        })
      }
    }

    this.validate(event.target.name);
  }

  showMessageForGmailPhone = (msg, type = NOTIFY_WARNING) => {
    if (type === NOTIFY_WARNING) {
      this.setState({
        warning: {
          phone_for_gmail: msg
        },
        message: {
          phone_for_gmail: ''
        }
      });
    } else if (type === NOTIFY_INFORMATION) {
      this.setState({
        message: {
          phone_for_gmail: msg
        },
        warning: {
          phone_for_gmail: ''
        }
      });
    } else {
      this.setState({
        message: {
          phone_for_gmail: ''
        },
        warning: {
          phone_for_gmail: msg
        }
      });
    }
  }

  showMessageForEmailPhone = (msg, type = NOTIFY_WARNING) => {
    let errors = this.state.errors;
    errors.phone_for_email = msg;
    this.setState({
      errors: errors
    });
  }

  onPhone4GmailChange = val => {
    // Clear verify code input
    // this.setState({sms_code_for_gmail: ''})
    // Clear warning box
    this.showMessageForGmailPhone(" ");
    if (val === undefined || val === null || val.trim() === '') {
      return;
    }
    let input = this.state.input;
    input.phone_for_gmail = val;
    this.setState({ input });
  }

  onPhone4EmailChange = val => {
    let input = this.state.input;
    input.phone_for_email = val;
    this.setState({ input });
    // this.state.input.phone_for_email = val;
    this.validate('phone_for_email');
  }

  responseGoogleFailed = (failure) => {
    console.log("responseGoogleFailed()");

    /******************************************************************************************/
    /********************** Unlock Google button disabled *************************************/
    if (this.state.disableGoogleButton) {
      this.setState({ disableGoogleButton: false });
    }
    /******************************************************************************************/
    this.setState({
      warning: {
        google_login: "Invalid Google Acount Information"
      }
    });
  }

  responseGoogle = (response) => {
    console.log("responseGoogle()");
    if (response === undefined || response === null ||
      response.profileObj === undefined || response.profileObj === null ||
      response.profileObj.email === undefined || response.profileObj.email === null) {
      // alert("Invalid Google Acount Information");
      return;
    }
    if (this.state.phoneId === undefined || this.state.phoneId === null ||
      this.state.phoneId === "") {
      this.showMessageForGmailPhone("Please verify with your phone and try again.");
      return;
    }
    let profile = response.profileObj;
    const newUser = {
      first_name: profile.familyName,
      last_name: profile.givenName,
      email: profile.email,
      password: profile.googleId,
      phoneId: this.state.phoneId,
      email_type: 1 // Gmail Sign Up
    }
    register(newUser, res => {
      /******************************************************************************************/
      /********************** Unlock Google button disabled ***************************************/
      if (this.state.disableGoogleButton) {
        this.setState({ disableGoogleButton: false });
      }
      /******************************************************************************************/
      if (res !== undefined && res !== null &&
        res.error !== undefined && res.error === 0) {
        me.props.history.push('/login', { email: me.state.input.email })
      } else {
        if (res.error !== undefined && res.error !== 0) {
          this.showMessageForGmailPhone(res.message);
        }
      }
    })
  }

  submitData = (param, recaptchaToken) => {
    const newUser = {
      first_name: me.state.input.first_name,
      last_name: me.state.input.last_name,
      email_type: 0,
      email: me.state.input.email,
      password: me.state.input.password,
      phone_for_email: me.state.input.phone_for_email
    }
    register(newUser, (ret) => {
      me.setState({ loading: false });
      if (!ret.error || ret.error === 1) {
        me.props.history.push(`/confirm`, { email: me.state.input.email });
        return;
      }
      let errors = this.state.errors;
      errors.register_result = ret.message;
      this.setState({ errors: errors });
    })
  }

  onSubmit = (ev) => {
    ev.preventDefault();
    this.setState({ loading: true });
    // setTimeout(MAX_TIMEOUT, this.onConnectionTimeout);
    if (this.validate()) {
      // Perform additional validation for email-phone
      this.setState({ loading: true });
      validatePhoneNumber(this.state.input.phone_for_email, resp => {
        me.setState({ loading: false });
        if (!resp.error) { // If no error
          me.setState({ loading: true });
          return this.recaptchaComponent.run(this.submitData);
        }
        this.showMessageForEmailPhone(resp.message);
      });
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <div>
        <Header />
        <div className="main-container py-20 px-10 lg:px-80">
          <div className="home-card w-full">
            <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Create a new account</p>
            <div className="flex signup-form">
              <div className="signup-content w-1/2 flex flex-col items-center justify-center md:pl-10 md:pr-20 md:pb-10 md:pt-0">
                <img src={signimg} alt="sign-logo" width={150} className="sign-logo mb-14" />
                <div className="signup-content_box w-full relative">
                  <div className="mb-10">
                    <PhoneInput
                      placeholder="Enter phone number"
                      name="phone_for_gmail"
                      value={this.state.phone_for_gmail}
                      onChange={this.onPhone4GmailChange}
                      className="phone-for-gmail block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded" />
                    <button
                      className="spinner-button absolute border border-grey-light button-bg p-5 hover-transition font-16 main-font focus:outline-none rounded text-white verify-button"
                      onClick={this.onRequestSmsCode}
                      disabled={this.state.loading}>
                      {this.state.loading && (
                        <i
                          className="fa od-spinner"
                          style={{ marginRight: "15px" }}
                        >( )</i>
                      )}
                      {this.state.loading && <span>Sending({this.state.loading_sms_verify_interval})</span>}
                      {!this.state.loading && <span>Send Code</span>}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="block border border-grey-light bg-gray-100  w-full p-5 mb-10 font-16 main-font focus:outline-none rounded "
                    name="sms_code_for_gmail"
                    value={this.state.sms_code_for_gmail}
                    onChange={this.handleInputChange}
                    placeholder="Verification Code" autoComplete="off" />
                  <span className="block help-block main-font text-red-400 mb-10 font-16 visible">{this.state.warning.phone_for_gmail}</span>
                  <span className="block help-block main-font text-green-400 mb-10 font-16 visible">{this.state.message.phone_for_gmail}</span>
                  <GoogleLogin
                    clientId={GOOGLE_LOGIN_CLIENT_ID}
                    buttonText="Google Sign Up"
                    onSuccess={this.responseGoogle}
                    onFailure={this.responseGoogle}
                    className="google-signup-button hover-transition"
                    disabled={this.state.disableGoogleButton}
                    cookiePolicy={'single_host_origin'}
                  />
                </div>
              </div>
              <div className="middle-line-container flex items-center justify-between">
                <hr className="middle-line" />
                <p className="main-font main-color font-16 px-5 divide-text">OR</p>
                <hr className="middle-line" />
              </div>
              <div className="w-1/2 signup-content border-l border-gray-300  md:pl-20 md:pr-10">
                {/* <form id="reg-form" className="form" onSubmit={this.onSubmit} autoComplete="off"> */}
                <span className="help-block main-font text-red-400 font-16">{this.state.errors.register_result}</span>
                <div className="text-black">
                  <div className="flex w-full">
                    <div className="mb-10 w-full md:w-1/2">
                      <input
                        type="text"
                        className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                        name="first_name"
                        id="first_name"
                        placeholder="First Name"
                        value={this.state.first_name}
                        onChange={this.handleInputChange} autoComplete="off" />
                      <span className="help-block main-font text-red-400 font-16">{this.state.errors.first_name}</span>
                    </div>
                    <div className="mb-10 ml-2 w-full md:w-1/2">
                      <input
                        type="text"
                        className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                        name="last_name"
                        id="last_name"
                        placeholder="Last Name"
                        value={this.state.last_name}
                        onChange={this.handleInputChange} autoComplete="off" />
                      <span className="help-block main-font text-red-400 font-16">{this.state.errors.last_name}</span>
                    </div>
                  </div>
                  <div className="mb-10 relative">
                    <input
                      type="text"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                      name="email"
                      id="email"
                      placeholder="Email"
                      value={this.state.email}
                      onChange={this.handleInputChange} autoComplete="off" />
                    <span className="help-block main-font text-red-400 font-14">{this.state.errors.email}</span>
                  </div>
                  <div className="mb-10">
                    <PhoneInput
                      placeholder="Enter phone number"
                      name="phone_for_email"
                      value={this.state.phone_for_email}
                      onChange={this.onPhone4EmailChange}
                      className="phone-for-email block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded" />
                    <span className="help-block main-font text-red-400 font-14">{this.state.errors.phone_for_email}</span>
                  </div>
                  <div className="mb-10">
                    <div className="password-container block w-full">
                      <input
                        type={this.state.showPassword ? "text" : "password"}
                        className="password-input border border-grey-light bg-gray-100 w-full p-5 font-16 main-font focus:outline-none rounded "
                        name="password"
                        value={this.state.password}
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
                      value={this.state.confirm_password}
                      onChange={this.handleInputChange}
                      placeholder="Confirm Password" autoComplete="off"
                    />
                    <span className="help-block main-font text-red-400 font-14">{this.state.errors.confirm_password}</span>
                  </div>
                  <button
                    className="spinner-button w-full text-center m-0 py-5 rounded button-bg text-white hover-transition font-16 main-font focus:outline-none"
                    onClick={this.onSubmit}
                    disabled={this.state.loading}>
                    {this.state.loading && (
                      <i
                        className="fa od-spinner"
                        style={{ marginRight: "15px" }}
                      >( )</i>
                    )}
                    {this.state.loading && <span>Submitting</span>}
                    {!this.state.loading && <span>Submit</span>}
                  </button>
                </div>
                <div className="main-font main-color font-16 m-8 capitalize">
                  Already have an account?
                  <Link className="border-b border-gray-400 main-color-blue ml-5" to="/login">Login here</Link>
                </div>
                {/* </form> */}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
