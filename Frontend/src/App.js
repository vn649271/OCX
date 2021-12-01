import React from "react";
// import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Homepage from "./components/views/Homepage";
import Exchange from "./components/views/Exchange";
import './App.css';
// import Signup from "./components/views/Signup";
// import Login from "./components/views/Login";
import Login from './components/views/Login'
import Register from './components/views/Register'
import Dashboard from './components/Dashboard'
import About from './components/About'


function App() {
  return (
    // <React.Fragment>
    <Router>
      {/* <Switch> */}
      <Route exact path="/">
        <Homepage />
      </Route>
      {/* <Route exact path="/signup">
            <Signup />
          </Route> */}
      {/* <Route exact path="/register">
        <Register />
      </Route> */}
      <Route path="/register" component={Register} />
      <Route exact path="/dashboard">
        <Dashboard />
      </Route>
      <Route exact path="/about">
        <About />
      </Route>
      <Route path="/login" component={Login} />
      {/* <Route exact path="/login">
        <Login />
      </Route> */}
      <Route exact path="/home">
        <Homepage />
      </Route>
      <Route exact path="/exchange">
        <Exchange />
      </Route>
      {/* </Switch> */}
    </Router >
    // </React.Fragment >
  );
}

export default App;
