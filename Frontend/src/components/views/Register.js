import React, { Component } from "react";
import { Link } from "react-router-dom";
import { register, verifyRecaptcha } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";

const SITE_KEY = '6LdoC28dAAAAACQ6Wbl7YPpOZVGHr9H-YQBKUkAA'; //process.env.RECAPTCHA_SITE_KEY;

var me;

export default class Register extends Component {


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
        <div id="reg">
          <div className="main-container">
            <div
              id="reg-row"
              className="flex justify-center items-center"
            >
              <div id="reg-column" className="w-1/2">
                <div id="reg-box" className="w-full">
                  <form id="reg-form" className="form" onSubmit={this.onSubmit}>
                    <div className="bg-grey-lighter min-h-screen flex flex-col">
                      <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
                        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
                          <h1 className="mb-8 text-3xl text-center">Sign up</h1>
                          <input
                            type="text"
                            className="block border border-grey-light w-full p-3 rounded mb-4"
                            name="first_name"
                            id="first_name"
                            autoComplete="none"
                            placeholder="First Name"
                            value={this.state.first_name}
                            onChange={this.onChange} />
                          <input
                            type="text"
                            className="block border border-grey-light w-full p-3 rounded mb-4"
                            name="last_name"
                            id="last_name"
                            autoComplete="none"
                            placeholder="Last Name"
                            value={this.state.last_name}
                            onChange={this.onChange} />

                          <input
                            type="email"
                            className="block border border-grey-light w-full p-3 rounded mb-4"
                            name="email"
                            id="email"
                            autoComplete="none"
                            placeholder="Email"
                            value={this.state.email}
                            onChange={this.onChange} />

                          <input
                            type="password"
                            className="block border border-grey-light w-full p-3 rounded mb-4"
                            name="password"
                            autoComplete="none"
                            value={this.state.password}
                            onChange={this.onChange}
                            placeholder="Password" />
                          <input
                            type="password"
                            className="block border border-grey-light w-full p-3 rounded mb-4"
                            name="c_password"
                            id="c_password"
                            autoComplete="none"
                            value={this.state.c_password}
                            onChange={this.onChange}
                            placeholder="Confirm Password" />
                          <input
                            type="submit"
                            className="w-full text-center py-3 rounded bg-green text-black hover:bg-green-dark focus:outline-none my-1"
                            value="Submit"
                          />
                        </div>
                        <div className="text-grey-dark mt-6">
                          Already have an account?
                          <Link className="no-underline border-b border-blue text-blue" to="/login">Login here</Link>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
