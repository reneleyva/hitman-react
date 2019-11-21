import Home from "./home/Home";
import React from "react"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AddAsignment from './addAsigment/AddAssignment'; 
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/addAsignment">
          <AddAsignment />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>  
    </Router>
  );
}

export default App;