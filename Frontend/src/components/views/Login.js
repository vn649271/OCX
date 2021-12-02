import React, { Component } from "react";
import { Link } from "react-router-dom";
import { login, verifyRecaptcha } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";
import RecaptchaComponent from "../common/Recaptcha";

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
    e.preventDefault()
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
