import React, { Component } from "react";
import { Link } from "react-router-dom";
import { register } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";
import FormValidator from '../common/FormValidator';
// import PasswordChecklist from "react-password-checklist"
import Alert from "../common/Alert"
import signimg from '../common/assets/images/img/main-img.png';
import RecaptchaComponent from "../common/Recaptcha";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
// import { Button, Spinner } from 'react-bootstrap'
// import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleLogin } from 'react-google-login';

const GOOGLE_LOGIN_CLIENT_ID = '533897933750-s85rovfjr2p6tg1pes1qdi89l8vo829g.apps.googleusercontent.com';

const BATCHED_VALIDATION = 0; // Validation mode
const INDIVIDUAL_VALIDATION = 1; // Validation mode
const MAX_TIMEOUT = process.env.MAX_TIMEOUT || 30000;

var me;

export default class Register extends Component {

  constructor(props) {
    super(props);
    me = this;

    this.state = {
      input: {},
      errors: {
        register_result: ''
      },
      loading: false
    }
    this.recaptchaComponent = new RecaptchaComponent();

    this.validate = this.validate.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitData = this.submitData.bind(this)
    this.responseGoogle = this.responseGoogle.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.onPhone4EmailChange = this.onPhone4EmailChange.bind(this)
    this.onConnectionTimeout = this.onConnectionTimeout.bind(this)

    /*
    this.validator = new FormValidator([{
      field: 'email',
      method: 'isEmail',
      validWhen: true,
      args: [/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/],
      message: 'Enter valid email address (like "victor@gmail.com").'
    }]);
    */
    // this.submitted = false;
  }

  componentDidMount() {
    document.getElementsByClassName('profile-dropdown-menu')[0].classList.add('hidden');
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

      console.log('validation of last_name');
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

      if (!input["password"]) {
        isValid = false;
        errors["password"] = "Please enter your password.";
      }
      if (typeof input["password"] !== "undefined") {
        if (input["password"].length < 6) {
          isValid = false;
          errors["password"] = "Please add at least 6 charachter.";
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
    
    if (validationMode == INDIVIDUAL_VALIDATION) {
      isValid = false;
    }
    return isValid;
  }

  onConnectionTimeout = () => {
    this.setState({ loading: false });
    Alert("Connection timed out. Please check your internet connection");
  }

  handleInputChange = event => {
    let input = this.state.input;
    input[event.target.name] = event.target.value;
    this.setState({
      input
    });
    console.log(input);
    this.validate(event.target.name);
  }

  onPhone4EmailChange = val => {
    this.state.input.phone_for_email = val;
    this.validate('phone_for_email');
  }

  onPhone4GmailChange = val => {
    this.state.input.phone_for_gmail = val;
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  responseGoogle = (response) => {
    if (response === undefined || response === null ||
      response.profileObj === undefined || response.profileObj === null ||
      response.profileObj.email === undefined || response.profileObj.email === null) {
      // alert("Invalid Google Acount Information");
      return;
    }
    let profile = response.profileObj;
    const newUser = {
      first_name: profile.familyName,
      last_name: profile.givenName,
      email: profile.email,
      password: profile.googleId,
      email_type: 1
    }
    register(newUser, res => {
      if (res !== undefined && res !== null &&
        res.error !== undefined && res.error === 0) {
        me.props.history.push('/login', { email: me.state.input.email })
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
      if (!ret.error) {
        me.props.history.push(`/confirm`, { email: me.state.input.email });
        return;
      }
      let errors = this.state.errors;
      errors.register_result = ret.message;
      this.setState({ errors: errors });
    })
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    setTimeout(MAX_TIMEOUT, this.onConnectionTimeout);
    if (this.validate()) {
      this.recaptchaComponent.run(this.submitData);
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
              <div className="signup-content w-1/2 flex flex-col items-center justify-center p-20 md:pb-10 md:pt-0">
                <img src={signimg} alt="sign-logo" width={150} className="sign-logo mb-14" />
                <div className="signup-content_box w-full relative">
                  <div className="mb-10">
                    <PhoneInput
                      placeholder="Enter phone number"
                      name="phone_for_gmail"
                      value={this.state.phone_for_email}
                      onChange={this.onPhone4GmailChange}
                      className="phone-for-gmail block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded" />
                    <button className="absolute border border-grey-light button-bg p-5 font-16 main-font focus:outline-none rounded text-white verify-button">Send Code</button>
                  </div>
                  <input
                    type="text"
                    className="block border border-grey-light bg-gray-100  w-full p-5 mb-10 font-16 main-font focus:outline-none rounded "
                    name="verification-code"
                    // value={this.state.phone_for_email}
                    onChange={this.handleInputChange}
                    placeholder="Verification Code" autoComplete="off" />
                  <GoogleLogin
                    clientId={GOOGLE_LOGIN_CLIENT_ID}
                    buttonText="Google Sign Up"
                    onSuccess={this.responseGoogle}
                    onFailure={this.responseGoogle}
                    className="google-signup-button hover-transition"
                    cookiePolicy={'single_host_origin'}
                  />
                </div>
              </div>
              <div className="w-1/2 signup-content border-l border-gray-300 pl-20 md:pl-10 pr-20">
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
                    <input
                      type="password"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                      name="password"
                      value={this.state.password}
                      onChange={this.handleInputChange}
                      placeholder="Password" autoComplete="off" />
                    <span className="help-block main-font text-red-400 font-14">{this.state.errors.password}</span>
                  </div>
                  <div className="mb-10">
                    <input
                      type="password"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                      name="confirm_password"
                      id="confirm_password"
                      value={this.state.confirm_password}
                      onChange={this.handleInputChange}
                      placeholder="Confirm Password" autoComplete="off" />
                    <span className="help-block main-font text-red-400 font-14">{this.state.errors.confirm_password}</span>
                  </div>
                  {/* <input
                      type="submit"
                      className="w-full text-center py-5 rounded button-bg text-white hover-transition font-16 main-font focus:outline-none my-1"
                      value="Submit" autoComplete="off"
                    /> */}
                  <button
                    className="spinner-button w-full text-center py-5 rounded button-bg text-white hover-transition font-16 main-font focus:outline-none my-1"
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
