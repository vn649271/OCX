import React, { Component } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import Alert from "../common/Alert";
import { verifyPinCode, requestPinCodeAgain } from "./UserFunction";


export default class Confirm extends Component {
  constructor(props) {
    super(props);

    this.onVerifyComplete = this.onVerifyComplete.bind(this)
    this.onVerify = this.onVerify.bind(this);
    this.onRequestPinCodeAgain = this.onRequestPinCodeAgain.bind(this)

    this.state = {
      verifyCode: '',
      email: props.location.state.email
    }
  }

  onVerifyComplete(ret) {
    if (!ret.error) {
      this.props.history.push(`/login`)
    } else {
      Alert(ret.message);
    }
  }

  onVerify = e => {
    let confirmCode = document.getElementById('confirm_code').value;
    verifyPinCode(confirmCode, this.onVerifyComplete)
  }

  onRequestPinCodeAgain = e => {
    requestPinCodeAgain(this.state.email);
  }

  render() {
    return (
      <div>
        <Header />
        <div className="main-container p-20">
          <div className="home-card mx-auto auth-form">
            <p className="text-center main-font font-30 main-color-blue mb-10 capitalize">Enter the verify code.</p>
            <div className="confirm-text main-color main-font font-14 mb-10">
              We want to make sure it's really you.
              In order to further verify your identity.
              Enter the verification code that was sent to your Email.
            </div>
            <input
              type="text"
              className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded mb-10"
              name="confirm_code"
              placeholder="Verifycode"
              id="confirm_code"
              // value={this.state.verifyCode}
              autoComplete="off" />
            <button type="button" onClick={this.onVerify} className="button-bg main-font text-white w-full block hover-transition blue-border rounded-lg py-3 my-10 font-16">Confirm</button>
            <button type="button" onClick={this.onRequestPinCodeAgain} className="bg-white main-font main-color-blue w-full block blue-border  hover-transition rounded-lg py-3 my-3 font-16">Resend Code</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
