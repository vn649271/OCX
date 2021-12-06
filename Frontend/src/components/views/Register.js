import React, { Component } from "react";
import { Link } from "react-router-dom";
import { register } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";
import FormValidator from '../common/FormValidator';
import signimg from '../common/assets/images/img/main-img.png';
import RecaptchaComponent from "../common/Recaptcha";

import { GoogleLogin } from 'react-google-login';

const GOOGLE_LOGIN_CLIENT_ID = '533897933750-s85rovfjr2p6tg1pes1qdi89l8vo829g.apps.googleusercontent.com';

var me;

export default class Register extends Component {


  constructor(props) {
    super(props);
    me = this;

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      c_password: '',
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
    this.handleFormSubmit = this.handleFormSubmit.bind(this)

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
      message: 'Enter valid email address (it has to include "@").'
    }, {
      field: 'phone',
      method: 'isEmpty',
      validWhen: false,
      message: 'Enter a phone number.'
    }, {
      field: 'phone',
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
    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      validation: this.validator.valid(),
    }
    this.submitted = false;
  }
  passwordMatch = (confirmation, state) => (state.password === confirmation)
  handleInputChange = event => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value,
    });
  }
  handleFormSubmit = event => {
    event.preventDefault();
    const validation = this.validator.validate(this.state);
    this.setState({
      validation
    });
    this.submitted = true;
    if (validation.isValid) {
      //reaches here if form validates successfully...
    }
  }

  onChange(e) {
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
        me.props.history.push('/login')
      }
    })
  }

  submitData = (param, recaptchaToken) => {
    if (me.state.password !== me.state.c_password) {
      alert("Invalid Password")
    }
    else if (me.state.first_name === '' || me.state.last_name === '' || me.state.email === '') {
      alert("Enter all the fields")
    }
    else {
      const newUser = {
        first_name: me.state.first_name,
        last_name: me.state.last_name,
        email_type: 0,
        email: me.state.email,
        password: me.state.password
      }
      register(newUser, () => {
        me.props.history.push(`/confirm`)
        // me.props.history.push(`/login`)
      })
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.handleFormSubmit(e);
    this.recaptchaComponent.run(this.submitData);
  }

  render() {
    let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
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
                  <div className={validation.phone.isInvalid && 'has-error'} className="mb-10">
                    <input
                      type="phone"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                      name="phone"
                      // value={this.state.phone}
                      // onChange={this.handleInputChange}
                      placeholder="Phone Number" autoComplete="off" />
                    <button className="absolute border border-grey-light button-bg p-5 font-16 main-font focus:outline-none rounded text-white verify-button">Send Code</button>
                    <span className="help-block main-font text-red-400 font-16">{validation.phone.message}</span>
                  </div>
                  <input
                    type="text"
                    className="block border border-grey-light bg-gray-100  w-full p-5 mb-10 font-16 main-font focus:outline-none rounded "
                    name="verification-code"
                    // value={this.state.phone}
                    // onChange={this.handleInputChange}
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
                      <div className={validation.email.isInvalid && 'has-error'} className="mb-10 mr-2">
                        <input
                          type="text"
                          className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                          name="first_name"
                          id="first_name"
                          placeholder="First Name"
                          value={this.state.first_name}
                          onChange={this.handleInputChange} autoComplete="off" />
                        <span className="help-block main-font text-red-400 font-16">{validation.first_name.message}</span>
                      </div>
                      <div className={validation.email.isInvalid && 'has-error'} className="mb-10 ml-2">
                        <input
                          type="text"
                          className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                          name="last_name"
                          id="last_name"
                          placeholder="Last Name"
                          value={this.state.last_name}
                          onChange={this.handleInputChange} autoComplete="off" />
                        <span className="help-block main-font text-red-400 font-16">{validation.last_name.message}</span>
                      </div>
                    </div>
                    <div className={validation.email.isInvalid && 'has-error'} className="mb-10 relative">
                      <input
                        type="email"
                        className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                        name="email"
                        id="email"
                        placeholder="Email"
                        value={this.state.email}
                        onChange={this.handleInputChange} autoComplete="off" />
                      <button className="absolute border border-grey-light button-bg p-5 font-16 main-font focus:outline-none rounded text-white verify-button">Send Code</button>
                      <span className="help-block main-font text-red-400 font-16">{validation.email.message}</span>
                    </div>
                    <div className={validation.phone.isInvalid && 'has-error'} className="mb-10">
                      <input
                        type="phone"
                        className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                        name="phone"
                        value={this.state.phone}
                        onChange={this.handleInputChange}
                        placeholder="Phone Number" autoComplete="off" />
                      <span className="help-block main-font text-red-400 font-16">{validation.phone.message}</span>
                    </div>
                    <div className={validation.password.isInvalid && 'has-error'} className="mb-10">
                      <input
                        type="password"
                        className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                        name="password"
                        value={this.state.password}
                        onChange={this.handleInputChange}
                        placeholder="Password" autoComplete="off" />
                      <span className="help-block main-font text-red-400 font-16">{validation.password.message}</span>
                    </div>
                    <div className={validation.password_confirmation.isInvalid && 'has-error'} className="mb-10">
                      <input
                        type="password"
                        className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                        name="c_password"
                        id="c_password"
                        value={this.state.c_password}
                        onChange={this.handleInputChange}
                        placeholder="Confirm Password" autoComplete="off" />
                      <span className="help-block main-font text-red-400 font-16">{validation.password_confirmation.message}</span>
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
