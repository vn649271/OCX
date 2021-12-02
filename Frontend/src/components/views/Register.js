import React, { Component } from "react";
import { Link } from "react-router-dom";
import { register, verifyRecaptcha, googleAuthenticaion } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";
import signimg from '../common/assets/images/img/main-img.png';
import RecaptchaComponent from "../common/Recaptcha";

import { GoogleLogin } from 'react-google-login';

const GOOGLE_LOGIN_CLIENT_ID = '618639350562-ta19emhaehlhdoelghnv5176jketlah4.apps.googleusercontent.com';

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
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  responseGoogle = (response) => {
    console.log(response);
  }

  submitData = (param, recaptchaToken) => {
    // me.setLoading(false);
    // me.setResponse(resp);
    console.log("!!!!!!!!!!!!! Register.submitData(): ", param, recaptchaToken);
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
      register(newUser, () => {
        me.props.history.push(`/login`)
      })
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.recaptchaComponent.run(this.submitData);
  }

  render() {
    return (
      <div>
        <Header />
        <div className="main-container py-20 px-10 lg:px-80">
          {/* <div className="flex">
            <p className="form-title mx-auto  capitalize main-font font-20 cursor-pointer m-0 hover-transition px-20  border-2 border-r-0 blue-border button-bg main-font text-white ">Sign Up</p>
          </div> */}
          <div className="home-card w-full">
            <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Create a new account</p>
            <div className="flex signup-form">
              <div className="signup-content w-1/2 flex flex-col items-center justify-around p-20">
                <img src={signimg} width={200} className="sign-logo" />
                <GoogleLogin
                  clientId={GOOGLE_LOGIN_CLIENT_ID}
                  buttonText="Google Singup"
                  onSuccess={this.responseGoogle}
                  onFailure={this.responseGoogle}
                  className="google-button"
                  cookiePolicy={'single_host_origin'}
                />
              </div>
              <div className="w-1/ signup-content border-l border-gray-300 pl-10">
                <form id="reg-form" className="form" onSubmit={this.onSubmit} autoComplete="off">
                  <div className=" px-6 py-8 text-black">
                    <input
                      type="text"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="first_name"
                      id="first_name"
                      autoComplete="none"
                      placeholder="First Name"
                      value={this.state.first_name}
                      onChange={this.onChange} autoComplete="off" />
                    <input
                      type="text"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="last_name"
                      id="last_name"
                      autoComplete="none"
                      placeholder="Last Name"
                      value={this.state.last_name}
                      onChange={this.onChange} autoComplete="off" />

                    <input
                      type="email"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="email"
                      id="email"
                      autoComplete="none"
                      placeholder="Email"
                      value={this.state.email}
                      onChange={this.onChange} autoComplete="off" />

                    <input
                      type="password"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="password"
                      autoComplete="none"
                      value={this.state.password}
                      onChange={this.onChange}
                      placeholder="Password" autoComplete="off" />
                    <input
                      type="password"
                      className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
                      name="c_password"
                      id="c_password"
                      autoComplete="none"
                      value={this.state.c_password}
                      onChange={this.onChange}
                      placeholder="Confirm Password" autoComplete="off" />
                    <input
                      type="submit"
                      className="w-full text-center py-3 rounded button-bg text-white hover-transition font-14 main-font focus:outline-none my-1"
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