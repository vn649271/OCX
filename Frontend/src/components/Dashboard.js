import React, { Component } from "react";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      country: "",
      errors: {}
    };
  }

  componentDidMount() {
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    this.setState({
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      email: decoded.email,
      country: decoded.country
    });
  }

  render() {
    return (
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <a className="navbar-brand" href="#">
            My JWT Test
          </a>
          <button  className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText"  aria-controls="navbarText"  aria-expanded="false" aria-label="Toggle navigation" >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav mr-auto">
              
            </ul>
            <span className="navbar-text">
              <Link to="/about">About Me</Link>
            </span>
          </div>
        </nav>
        <div className="container mt-5">
            <div className="jumbotron">
                <h1 className="display-4">Hello, {this.state.first_name}</h1>
                <p className="lead">And Thanks for being here!</p>
                <hr className="my-4"/>
                <p>There is a whole lot story to tell, See you then...</p>
                
            </div>
        </div>
      </div>
    );
  }
}
