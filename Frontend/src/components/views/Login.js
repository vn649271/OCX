import React, { Component } from "react";
import { Link } from "react-router-dom";
import { login } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errors: ''

    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }
  // componentDidMount(){
  //     document.body.style.background = "#17a2b8";
  // }
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }
  onSubmit(e) {
    e.preventDefault()

    const user = {
      email: this.state.email,
      password: this.state.password
    }

    login(user).then(res => {
      if (res) {
        this.props.history.push('/home')
      }
    })
  }


  render() {
    return (
      <div>
        <Header />
        <div id="login">

          <div className="main-container">
            <div
              id="login-row"
              className="flex justify-center items-center"
            >
              <div id="login-column" className="w-1/2">
                <div id="login-box" className="w-full">
                  <form id="login-form" className="form" onSubmit={this.onSubmit}>
                    <h3 className="text-center text-info">Login</h3>
                    <input
                      type="email"
                      className="block border border-grey-light w-full p-3 rounded mb-4"
                      name="email"
                      id="username"
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
                      type="submit"
                      className="w-full text-center py-3 rounded bg-green text-black hover:bg-green-dark focus:outline-none my-1"
                      value="Login"
                    />

                    <div id="register-link" className="text-right">

                      <Link className="text-info" to="/register">Register here</Link>
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
