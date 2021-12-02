import React, { Component } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";



export default class Confirm extends Component {
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
              autoComplete="off" />


            {/* <form id="login-form" className="form" onSubmit={this.onSubmit}>
              <GoogleLogin
                clientId={GOOGLE_LOGIN_CLIENT_ID}
                buttonText="Google Singup"
                onSuccess={this.responseGoogle}
                onFailure={this.responseGoogle}
                className="google-button"
                cookiePolicy={'single_host_origin'}
              />
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
            </form> */}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
