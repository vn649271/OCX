import React, { Component } from "react";
import { Link } from "react-router-dom";
import { login, verifyRecaptcha } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";

const SITE_KEY = '6LdoC28dAAAAACQ6Wbl7YPpOZVGHr9H-YQBKUkAA'; //process.env.RECAPTCHA_SITE_KEY;

var me;

export default class Sign extends Component {


  constructor(props) {
    super(props);
    me = this;

    /***** Begin of initialization for reCAPTCHA ******/
    const loadScriptByURL = (id, url, callback) => {
      const isScriptExist = document.getElementById(id);

      if (!isScriptExist) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.id = id;
        script.onload = function () {
          if (callback) callback();
        };
        document.body.appendChild(script);
      }

      if (isScriptExist && callback) callback();
    }
    // load the script by passing the URL
    loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`, function () {
      console.log("Script loaded!");
    });
    /***** End of initialization for reCAPTCHA ******/

    this.state = {
      email: '',
      password: '',
      errors: ''

    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitData = this.submitData.bind(this)
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  submitData = (token) => {
    // call a backend API to verify reCAPTCHA response
    verifyRecaptcha(token, resp => {
      const user = {
        email: this.state.email,
        password: this.state.password
      }
      login(user).then(res => {
        if (res) {
          me.props.history.push('/home')
        }
      })
    });
  }

  onSubmit(e) {
    e.preventDefault()
    if (window.grecaptcha == undefined || window.grecaptcha == null) {
      alert("Failed to init reCAPTCHA");
      return;
    }
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(token => {
        me.submitData(token);
      });
    });
  }


  render() {
    return (
      <div>
        <Header />
        <div className="main-container p-20">
          <div className="home-card mx-auto auth-form">
            <form id="login-form" className="form" onSubmit={this.onSubmit}>
              <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Sign In your account</p>

              <input
                type="email"
                className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                name="email"
                id="username"
                autoComplete="none"
                placeholder="Email"
                value={this.state.email}
                onChange={this.onChange}
                autoComplete="off" />

              <input
                type="password"
                className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                name="password"
                autoComplete="none"
                value={this.state.password}
                onChange={this.onChange}
                placeholder="Password"
                autoComplete="off" />

              <input
                type="submit"
                className="w-full text-center py-3 rounded button-bg text-white hover-transition font-14 main-font focus:outline-none m"
                value="Login"
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
