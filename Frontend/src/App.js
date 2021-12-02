import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Homepage from "./components/views/Homepage";
import Exchange from "./components/views/Exchange";
import Liquidity from "./components/views/Liquidity";
import Login from './components/views/Login'
import Register from './components/views/Register'
import Confirm from "./components/views/Confirm";

function App() {
  return (
    <Router>
      <Route exact path="/">
        <Homepage />
      </Route>
      <Route exact path="/home">
        <Homepage />
      </Route>
      <Route exact path="/exchange">
        <Exchange />
      </Route>
      <Route exact path="/liquidity">
        <Liquidity />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/confirm" component={Confirm} />
    </Router >
  );
}

export default App;
