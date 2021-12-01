import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Homepage from "./components/views/Homepage";
import Exchange from "./components/views/Exchange";
import './App.css';


function App() {
  return (
    <React.Fragment>
      <Router>
        <Switch>
          <Route exact path="/">
            <Homepage />
          </Route>
          <Route exact path="/home">
            <Homepage />
          </Route>
          <Route exact path="/exchange">
            <Exchange />
          </Route>
        </Switch>
      </Router>
    </React.Fragment>
  );
}

export default App;
