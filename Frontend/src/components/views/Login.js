import React, { Component } from "react";
import { Link } from "react-router-dom";
import { login } from "../../service/UserAuth";
import Header from "../common/Header";
import Footer from "../common/Footer";
import RecaptchaComponent from "../common/Recaptcha";
import { GoogleLogin } from 'react-google-login';
import Alert from "../common/Alert";
import { GOOGLE_LOGIN_CLIENT_ID } from "../../Contants";

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
		loading: false,
		disableGoogleButton: false,
		hide_link_to_signup: true
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
    this.responseGoogleFailed = this.responseGoogleFailed.bind(this);
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
    // document.getElementsByClassName('profile-dropdown-menu')[0].classList.add('hidden');
    /******************************************************************************************/
    /********************** Lock Google button disabled ***************************************/
    let googleButton = document.getElementsByClassName('google-login-button')[0];
    googleButton.onclick = function(ev) {
      me.setState({
        warning: {
          google_login: ""
        }
      });
      me.googleButtonTimer = setTimeout(() => {
        me.setState({disableGoogleButton: true});
		me.setState({hide_link_to_signup: true});
      }, 100);
    }
    /******************************************************************************************/
  }

  responseGoogleFailed = (failure) => {
    /******************************************************************************************/
    /********************** Unlock Google button disabled *************************************/
    if (this.state.disableGoogleButton) {
      this.setState({disableGoogleButton: false});
      clearTimeout(this.googleButtonTimer);
    }
    /******************************************************************************************/
    this.setState({
      warning: {
        google_login: "Invalid Google Acount Information"
      }
    });
  }

  responseGoogle = (response) => {
    /******************************************************************************************/
    /********************** Unlock Google button disabled ***************************************/
    if (this.state.disableGoogleButton) {
      this.setState({disableGoogleButton: false});
      clearTimeout(this.googleButtonTimer);
    }
    /******************************************************************************************/
    if (response === undefined || response === null ||
    response.profileObj === undefined || response.profileObj === null ||
    response.profileObj.email === undefined || response.profileObj.email === null) {
      console.log("Login.responseGoogle(): this.rmCheck=", this.rmCheck);
      if (this.rmCheck) {
        this.setState({
          warning: {
            google_login: "Unknown error in Google Login."
          }
        });
      }
      return;
    }
    var profile = response.profileObj;
    const user = {
      email: profile.email,
      password: profile.googleId
    }
	me.setState({loading: true})
    login(user, res => {
		me.setState({loading: false})

	    if (res !== undefined && res !== null &&
    	res.error !== undefined && res.error === 0) {
        	localStorage.setItem("userToken", res.message)
	        localStorage.setItem("email", profile.email)
    	    me.props.history.push('/dashboard')
	    } else {
    	    me.setState({
        		warning: {
			        google_login: res.message
		        }
        	});
		    if (res.error == -2) {
				me.setState({hide_link_to_signup: false})
			}
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
              onFailure={this.responseGoogleFailed}
              className="google-login-button hover-transition"
              disabled={this.state.disableGoogleButton}
              cookiePolicy={'single_host_origin'}
            />
			<div>
	            <span id="warning-message-box-for-google-login-failure" className="block help-block main-font text-red-400 mt-5 mb-10 font-16">{this.state.warning.google_login}</span>
				<Link id='link-to-signup-popup' className="border-b border-gray-400 main-color-blue ml-5" hidden={this.state.hide_link_to_signup} to="/register">Sign Up Here</Link>
			</div>
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
            </div>
            <span className="help-block main-font text-red-400 font-16">{this.state.notify}</span>
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
