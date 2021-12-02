import React, { Component } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { verifyPinCode } from "./UserFunction";


export default class Confirm extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);

    this.state = {
      verifyCode: ''
    }
  }

  onChange = e => {
    verifyPinCode(e.target.value, ret => {
      if (ret) {
        this.props.history.push(`/login`)
      } else {
        console.log("Invalid Pin Code");
      }
    })
  }

  render() {
    return (
      <div>
        <Header />
        <div className="main-container p-20">
          <div className="home-card mx-auto auth-form">
            <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Please check your email and enter the verify code.</p>
            <input
              type="text"
              className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
              name="confirm"
              placeholder="Verifycode"
              id="confirm"
              onChange={this.onChange}
              autoComplete="off" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
