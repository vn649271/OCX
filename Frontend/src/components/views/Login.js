import React, { Component } from "react";
import { Link } from "react-router-dom";
import { login } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";
import RecaptchaComponent from "../common/Recaptcha";
import { GoogleLogin } from 'react-google-login';

const GOOGLE_LOGIN_CLIENT_ID = '533897933750-s85rovfjr2p6tg1pes1qdi89l8vo829g.apps.googleusercontent.com';


var me;

export default class Login extends Component {


  constructor(props) {
    super(props);
    me = this;

    this.state = {
      email: '',
      password: '',
      errors: ''
    }
    this.recaptchaComponent = new RecaptchaComponent();
    

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitData = this.submitData.bind(this)
    this.responseGoogle = this.responseGoogle.bind(this)
  }
  
  componentDidMount() {
    this.rmCheck = document.getElementById("rememberMe");
    this.emailInput = document.getElementById("username");
    
    if (localStorage.checkbox && localStorage.checkbox !== "") {
        this.rmCheck.setAttribute("checked", "checked");
	this.setState({ email: localStorage.username });
        // this.emailInput.value = localStorage.username;
    } else {
        this.rmCheck.removeAttribute("checked");
        this.emailInput.value = "";
    }
  }

  responseGoogle = (response) => {
    if (response === undefined || response === null ||
    response.profileObj === undefined || response.profileObj === null ||
    response.profileObj.email === undefined || response.profileObj.email === null ) {
      alert("Invalid Google Acount Information");
      return;
    }
    let profile = response.profileObj;
    const user = {
      email: profile.email,
      password: profile.googleId
    }
    login(user).then(res => {
      if (res) {
        me.props.history.push('/home')
      }
    })
  }
  
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  submitData = (token) => {
    // call a backend API to verify reCAPTCHA response
    const user = {
      email: this.state.email,
      password: this.state.password
    }
    login(user).then(res => {
      if (res) {
        me.props.history.push('/home')
      }
    })
  }

  onSubmit(e) {
    e.preventDefault();

    if (this.rmCheck.checked && this.emailInput.value !== "") {
        localStorage.username = this.emailInput.value;
        localStorage.checkbox = this.rmCheck.value;
    } else {
        localStorage.username = "";
        localStorage.checkbox = "";
    }

    this.recaptchaComponent.run(this.submitData);
  }

  render() {
    return (
      <div>
        <Header />
        <div className="main-container p-20">
          <div className="home-card mx-auto auth-form">
            <form id="login-form" className="form" onSubmit={this.onSubmit}>
              <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Sign In your account</p>
              <GoogleLogin
                clientId={GOOGLE_LOGIN_CLIENT_ID}
                buttonText="Google Sign In"
                onSuccess={this.responseGoogle}
                onFailure={this.responseGoogle}
                className="google-login-button"
                cookiePolicy={'single_host_origin'}
              />
              <input
                type="email"
                className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                name="email"
                id="username"
                placeholder="Email"
                value={this.state.email}
                onChange={this.onChange}
                autoComplete="off" />

              <input
                type="password"
                className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                name="password"
                value={this.state.password}
                onChange={this.onChange}
                placeholder="Password"
                 autoComplete="off" />
	      <div className="flex items-center rememberme-container">
                <input 
	          type="checkbox" 
	          value="lsRememberMe" 
	          id="rememberMe" /> 
	        <label 
	          for="rememberMe" className="main-font main-color ml-3 font-14">
	            Remember me
	        </label>
	      </div>
              <input
                type="submit"
                className="w-full text-center py-3 rounded button-bg text-white hover-transition font-14 main-font focus:outline-none m"
                value="Sign In"
              />

              <div className="main-font main-color font-14 my-8 capitalize">
                Do you want create an account?
                <Link className="border-b border-gray-400 main-color-blue ml-5" to="/register">Sign Up Here</Link>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
