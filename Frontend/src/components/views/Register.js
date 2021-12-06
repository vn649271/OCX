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

import { GoogleLogin } from 'react-google-login';

const GOOGLE_LOGIN_CLIENT_ID = '533897933750-s85rovfjr2p6tg1pes1qdi89l8vo829g.apps.googleusercontent.com';

var me;

export default class Register extends Component {

  constructor(props) {
    super(props);
    me = this;

    this.state = {
      input: {},
      errors: {}
    }
    this.recaptchaComponent = new RecaptchaComponent();

    // this.setLoading = this.setLoading.bind(this)
    // this.setResponse = this.setResponse.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitData = this.submitData.bind(this)
    this.responseGoogle = this.responseGoogle.bind(this)
    this.passwordMatch = this.passwordMatch.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.setPassword = this.setPassword.bind(this)
    this.setPasswordConfirm = this.setPasswordConfirm.bind(this)
    this.validate = this.validate.bind(this)
    this.onPhone4EmailChange = this.onPhone4EmailChange.bind(this)

    /*
    this.validator = new FormValidator([{
      field: 'first_name',
      method: 'isEmpty',
      validWhen: false,
      message: 'Enter first name.'
    },
    {
      field: 'last_name',
      method: 'isEmpty',
      validWhen: false,
      message: 'Enter last name.'
    }, {
      field: 'email',
      method: 'isEmpty',
      validWhen: false,
      message: 'Enter your email address.'
    }, {
      field: 'email',
      method: 'isEmail',
      validWhen: true,
      args: [/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/],
      message: 'Enter valid email address (like "victor@gmail.com").'
    }, {
      field: 'phone_for_email',
      method: 'isEmpty',
      validWhen: false,
      message: 'Enter a phone_for_email number.'
    }, {
      field: 'phone_for_email',
      method: 'matches',
      args: [/^\(?\d\d\d\)? ?\d\d\d-?\d\d\d\d$/],
      validWhen: true,
      message: 'Enter valid phone number (10 digits).'
    }, {
      field: 'password',
      method: 'isEmpty',
      validWhen: false,
      message: 'Enter password.'
    }, {
      field: 'password_confirmation',
      method: 'isEmpty',
      validWhen: false,
      message: 'Enter Password confirmation.'
    }, {
      field: 'password_confirmation',
      method: this.passwordMatch, // notice that we are passing a custom function here
      validWhen: true,
      message: 'Password and password confirmation do not match.'
    }]);
    */
    // this.submitted = false;
  }

  passwordMatch = (confirmation, state) => (state.password === confirmation)

  componentDidMount() {
    document.getElementsByClassName('profile-dropdown-menu')[0].classList.add('hidden');
  }

  handleInputChange = event => {
    let input = this.state.input;
    input[event.target.name] = event.target.value;

    this.setState({
      input
    });
  }

  onPhone4EmailChange = val => {
    console.log(val)
    this.state.input.phone_for_email = val;
    console.log(this.state.input);
  }

  onPhone4GmailChange = val => {
    console.log(val)
    this.state.input.phone_for_gmail = val;
    console.log(this.state.input);
  }

  validate = () => {
    let input = this.state.input;
    let errors = {
      first_name: '',
      last_name: '',
      email: '',
      phone_for_email: '',
      password: '',
      confirm_password: '',
    };
    this.setState({ errors: errors });

    let isValid = true;

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

    if (!input["password"]) {
      isValid = false;
      errors["password"] = "Please enter your password.";
    }

    if (!input["confirm_password"]) {
      isValid = false;
      errors["confirm_password"] = "Please enter your confirm password.";
    }

    if (typeof input["password"] !== "undefined") {
      if (input["password"].length < 6) {
        isValid = false;
        errors["password"] = "Please add at least 6 charachter.";
      }
    }

    if (typeof input["password"] !== "undefined" && typeof input["confirm_password"] !== "undefined") {
      if (input["password"] !== input["confirm_password"]) {
        isValid = false;
        errors["confirm_password"] = "Passwords don't match.";
      }
    }

    if (!input["phone_for_email"]) {
      isValid = false;
      errors["phone_for_email"] = 'Please enter phone number';
    }
    // pattern = new RegExp(/((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/);
    // if (!pattern.test(input["email"])) {
    //   isValid = false;
    //   errors["phone_for_email"] = 'Please enter valid phone number(10 digits)';
    // }

    // pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    // if (!pattern.test(input["phone_for_email"])) {
    //   isValid = false;
    //   errors["phone_for_email"] = 'Please enter valid phone number';
    // }

    this.setState({
      errors: errors
    });

    return isValid;
  }

  setPassword = value => { this.setState({ password: value }) }
  setPasswordConfirm = value => { this.setState({ confirm_password: value }) }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
    console.log(e.target)
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
        me.props.history.push('/login')
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
    register(newUser, () => {
      me.props.history.push(`/confirm`)
      // me.props.history.push(`/login`)
    })
  }

  onSubmit = (e) => {
    e.preventDefault();
    if (this.validate()) {
      console.log("validation OK!");
      this.recaptchaComponent.run(this.submitData);
    }
  }

  render() {
    // let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
    return (
      <div>
        <Header />
        <div className="main-container py-20 px-10 lg:px-80">
          <div className="home-card w-full">
            <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Create a new account</p>
            <div className="flex signup-form">
              <div className="signup-content w-1/2 flex flex-col items-center justify-center p-20 md:p-10">
                <img src={signimg} alt="sign-logo" width={200} className="sign-logo mb-16" />
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
                  {/* <div className="phone-verify-notification mb-10">
                    <input
                      type="phone"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                      name="phone_for_email"
                      // value={this.state.phone_for_email}
                      onChange={this.handleInputChange}
                      placeholder="Phone Number" autoComplete="off" />
                    <button className="absolute border border-grey-light button-bg p-5 font-16 main-font focus:outline-none rounded text-white verify-button">Send Code</button>
                    <span className="help-block main-font text-red-400 font-16">{this.state.errors.phone_for_email}</span>
                  </div> */}
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
                <form id="reg-form" className="form" onSubmit={this.onSubmit} autoComplete="off">
                  <div className="text-black">
                    <div className="flex">
                      <div className="mb-10 ml-2">
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
                      <div className="mb-10 ml-2">
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
                    <input
                      type="submit"
                      className="w-full text-center py-5 rounded button-bg text-white hover-transition font-16 main-font focus:outline-none my-1"
                      value="Submit" autoComplete="off"
                    />
                  </div>
                  <div className="main-font main-color font-16 m-8 capitalize">
                    Already have an account?
                    <Link className="border-b border-gray-400 main-color-blue ml-5" to="/login">Login here</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
