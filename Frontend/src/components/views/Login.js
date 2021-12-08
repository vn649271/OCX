import React, { Component } from "react";
import { Link } from "react-router-dom";
import { login } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";
import RecaptchaComponent from "../common/Recaptcha";
import { GoogleLogin } from 'react-google-login';
import Alert from "../common/Alert";
import { GOOGLE_LOGIN_CLIENT_ID } from "../../Contant";

var me;

export default class Login extends Component {


  constructor(props) {
    super(props);
    me = this;

    this.state = {
      email: '',
      password: '',
      errors: {
        email: '',
        password: ''
      },
      notify: '',
      warning: {
        google_login: ''
      },
      loading: false
    }
    if (props !== undefined && props !== null &&
      props.location !== undefined && props.location !== null &&
      props.location.state !== undefined && props.location.state !== null &&
      props.location.state.email !== undefined && props.location.state.email !== null) {
      localStorage.email = props.location.state.email;
    }

    this.recaptchaComponent = new RecaptchaComponent();

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.submitData = this.submitData.bind(this);
    this.responseGoogle = this.responseGoogle.bind(this);
  }

  componentDidMount() {
    this.rmCheck = document.getElementById("rememberMe");
    this.emailInput = document.getElementById("username");

    if (localStorage.checkbox && localStorage.checkbox !== "") {
      this.rmCheck.setAttribute("checked", "checked");
      this.setState({ email: localStorage.email });
      // this.emailInput.value = localStorage.email;
    } else {
      this.rmCheck.removeAttribute("checked");
      this.emailInput.value = "";
    }
    document.getElementsByClassName('profile-dropdown-menu')[0].classList.add('hidden');
  }

  responseGoogle = (response) => {
    if (response === undefined || response === null ||
      response.profileObj === undefined || response.profileObj === null ||
      response.profileObj.email === undefined || response.profileObj.email === null) {
      this.setState({
        warning: {
          google_login: "Invalid Google Acount Information"
        }
      });
      return;
    }
    var profile = response.profileObj;
    const user = {
      email: profile.email,
      password: profile.googleId
    }
    login(user, res => {
      if (res !== undefined && res !== null &&
        res.error !== undefined && res.error === 0) {
        localStorage.setItem("userToken", res.message)
        localStorage.setItem("email", profile.email)
        me.props.history.push('/dashboard')
      } else {
        this.setState({
          warning: {
            google_login: res.message
          }
        });
      }
    })
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  submitData = (params, token) => {
    if (token === null) {
      me.setState({ loading: false });
      Alert("Failed to init reCAPTCHA");
      return;
    }
    // call a backend API to verify reCAPTCHA response
    const user = {
      email: this.state.email,
      password: this.state.password
    }
    login(user, res => {
      me.setState({ loading: false });
      if (!res.error) {
        localStorage.setItem("userToken", res.message)
        localStorage.setItem("email", this.state.email)
        me.props.history.push('/dashboard')
      } else {
        this.setState({ notify: res.message });
      }
    })
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.state.email.trim() === "") {
      this.setState({ errors: { email: "Please input your Email" } });
      return;
    }
    if (this.state.password.trim() === "") {
      this.setState({ errors: { password: "Please input password for your Email" } });
      return;
    }
    if (this.rmCheck.checked && this.emailInput.value !== "") {
      localStorage.email = this.emailInput.value;
      localStorage.checkbox = this.rmCheck.value;
    } else {
      localStorage.email = "";
      localStorage.checkbox = "";
    }
    this.setState({ loading: true });
    this.recaptchaComponent.run(this.submitData);
  }

  render() {
    return (
      <div>
        <Header />
        <div className="main-container p-20">
          <div className="home-card mx-auto auth-form">
            {/* <form id="login-form" className="form" onSubmit={this.onSubmit}> */}
            <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Login</p>
            <GoogleLogin
              clientId={GOOGLE_LOGIN_CLIENT_ID}
              buttonText="Google Login"
              onSuccess={this.responseGoogle}
              onFailure={this.responseGoogle}
              className="google-login-button"
              cookiePolicy={'single_host_origin'}
            />
            <span className="block help-block main-font text-red-400 mt-5 mb-10 font-16">{this.state.warning.google_login}</span>
            <input
              type="email"
              className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
              name="email"
              id="username"
              placeholder="Email"
              value={this.state.email}
              onChange={this.onChange}
              autoComplete="off" />
            <span className="help-block main-font text-red-400 font-16">{this.state.errors.email}</span>
            <input
              type="password"
              className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
              name="password"
              value={this.state.password}
              onChange={this.onChange}
              placeholder="Password"
              autoComplete="off" />
            <span className="help-block main-font text-red-400 font-16">{this.state.errors.password}</span>
            <div className="flex items-center rememberme-container">
              <input
                type="checkbox"
                value="lsRememberMe"
                id="rememberMe" />
              <label
                htmlFor="rememberMe" className="main-font main-color ml-3 font-14">
                Remember me
              </label>
              <span className="help-block main-font text-red-400 font-16">{this.state.notify}</span>
            </div>
            {/* <input
                type="submit"
                className="w-full text-center py-3 rounded button-bg text-white hover-transition font-14 main-font focus:outline-none m"
                value="Login"
              /> */}
            <button
              className="spinner-button w-full text-center py-3 rounded button-bg text-white hover-transition font-14 main-font focus:outline-none m"
              onClick={this.onSubmit}
              disabled={this.state.loading}>
              {this.state.loading && (
                <i
                  className="fa od-spinner"
                  style={{ marginRight: "15px" }}
                >( )</i>
              )}
              {this.state.loading && <span>Login</span>}
              {!this.state.loading && <span>Login</span>}
            </button>
            <div className="main-font main-color font-14 my-8 capitalize">
              Do you want create an account?
              <Link className="border-b border-gray-400 main-color-blue ml-5" to="/register">Sign Up Here</Link>
            </div>
            {/* </form> */}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
