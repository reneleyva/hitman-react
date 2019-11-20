import React from "react"; 
import Login from "../login/Login"; 
import {  Navbar, Nav } from "react-bootstrap";

class Home extends React.Component {
  constructor(props) {
    super(props); 
    this.state = {
      logedIn: false
    }

    //For when the login is successful
    this.handleLogIn = this.handleLogIn.bind(this)
  }

  handleLogIn() {
    this.setState({logedIn: true});
  }

  render() {
    if (this.state.logedIn) {
      return (
        <div className="App container">
          <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">Hitman</Navbar.Brand>
          <Nav className="mr-auto">
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="#features">Features</Nav.Link>
          <Nav.Link href="#pricing">Pricing</Nav.Link>
          </Nav>
          </Navbar>
        </div>
      );
    }

    return (<Login onLogin={this.handleLogIn} />)
    
  }
}

export default Home; 