import React, { Component } from "react";
import { Link } from "react-router-dom";
import { register, verifyRecaptcha } from "./views/UserFunction";
import Header from "./common/Header";
import Footer from "./common/Footer";
import signimg from './common/assets/images/img/main-img.png';


const SITE_KEY = '6LdoC28dAAAAACQ6Wbl7YPpOZVGHr9H-YQBKUkAA'; //process.env.RECAPTCHA_SITE_KEY;

var me;

export default class Signup extends Component {


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
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      c_password: '',
      errors: {}
    }

    // this.setLoading = this.setLoading.bind(this)
    // this.setResponse = this.setResponse.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  submitData = (token) => {
    // call a backend API to verify reCAPTCHA response
    verifyRecaptcha(token, resp => {
      // me.setLoading(false);
      console.log('verify recaptcha: ', resp);
      // me.setResponse(resp);
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
          email: me.state.email,
          password: me.state.password
        }
        register(newUser).then(res => {
          me.props.history.push(`/login`)
        })
      }
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
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
        <div className="main-container py-20 px-80">
          {/* <div className="flex">
            <p className="form-title mx-auto  capitalize main-font font-20 cursor-pointer m-0 hover-transition px-20  border-2 border-r-0 blue-border button-bg main-font text-white ">Sign Up</p>
          </div> */}
          <div className="home-card w-full">
            <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Create a new account</p>
            <div className="flex">
              <div className="sign-left w-1/2 flex flex-col items-center justify-around p-20">
                <img src={signimg} width={200}/>
                <a href="https://pngimage.net/google-login-button-png/" title="Image from PNG Image">
                  <img src="https://pngimage.net/wp-content/uploads/2018/06/google-login-button-png.png" width={300} alt="google login button png" />
                </a>
              </div>
              <div className="w-1/2 border-l border-gray-300 pl-10">
                <form id="reg-form" className="form" onSubmit={this.onSubmit} autocomplete="off">
                  <div className=" px-6 py-8 text-black">
                    <input
                      type="text"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="first_name"
                      id="first_name"
                      autoComplete="none"
                      placeholder="First Name"
                      value={this.state.first_name}
                      onChange={this.onChange} autocomplete="off" />
                    <input
                      type="text"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="last_name"
                      id="last_name"
                      autoComplete="none"
                      placeholder="Last Name"
                      value={this.state.last_name}
                      onChange={this.onChange} autocomplete="off" />

                    <input
                      type="email"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="email"
                      id="email"
                      autoComplete="none"
                      placeholder="Email"
                      value={this.state.email}
                      onChange={this.onChange} autocomplete="off" />

                    <input
                      type="password"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="password"
                      autoComplete="none"
                      value={this.state.password}
                      onChange={this.onChange}
                      placeholder="Password" autocomplete="off" />
                    <input
                      type="password"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="c_password"
                      id="c_password"
                      autoComplete="none"
                      value={this.state.c_password}
                      onChange={this.onChange}
                      placeholder="Confirm Password" autocomplete="off" />
                    <input
                      type="submit"
                      className="w-full text-center py-3 rounded button-bg text-white hover-transition font-14 main-font focus:outline-none my-1"
                      value="Submit" autocomplete="off"
                    />
                  </div>
                  <div className="main-font main-color font-16 m-8">
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
