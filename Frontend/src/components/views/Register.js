import React, { Component } from "react";
import { Link } from "react-router-dom";
import { register } from "./UserFunction";
import Header from "../common/Header";
import Footer from "../common/Footer";

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      c_password: '',
      errors: {}
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
    if (this.state.password !== this.state.c_password) {
      alert("Invalid Password")
    }
    else if (this.state.first_name === '' || this.state.last_name === '' || this.state.email === '') {
      alert("Enter all the fields")
    }
    else {
      const newUser = {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        password: this.state.password
      }

      register(newUser).then(res => {
        this.props.history.push(`/login`)
      })
    }
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
