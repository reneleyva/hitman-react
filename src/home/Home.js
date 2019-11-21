import React from "react"; 
import Login from "../login/Login"; 
import {  Navbar, Nav, Table, Button } from "react-bootstrap";
import "./Home.css";
import 'font-awesome/css/font-awesome.min.css';
import 'sweetalert/dist/sweetalert.css'; 
import SweetAlert from 'sweetalert-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios"; 

class Home extends React.Component {
  constructor(props) {
    super(props); 
    let info = localStorage.getItem("hitmanInfo"); 
    let hitmanInfo = (info !== "null") ? JSON.parse(info) : {}; 
    let userType = hitmanInfo.type; 
    let isBoss = (userType === 'boss');
    let isHitman = (userType === 'hitman');
    let isBigboss = (userType === 'bigboss');
    this.state = {
      logedIn: false,
      isBoss: isBoss, 
      isHitman: isHitman, 
      isBigboss: isBigboss,
      assignments: [], 
      givenAssignments: [],
      myHitmans: [],
      hitmanInfo: hitmanInfo, 
      confirmAssignment: false, 
      confirmFailAssignment: false
    }

    //For when the login is successful
    this.setLogedIn = this.setLogedIn.bind(this)
  }

  componentDidMount() {
    this.checkToken().then(res => {
      if (res)
        this.fetchData(); 
    }).catch(err => console.log(err) );
  }

  /**
   * Gets all the user assignments
   * @param {string} token the user token
   * @param {number} idHitman the idHitman of the user in the db
   */
  getAssignments(token, idHitman) {
    const config = {
        headers: {'Authorization': "Bearer " + token}
    };
    const url = "http://localhost:8080/assignments/"+idHitman;
    return axios.get(url, config); 
  }

  getGivenAssigments(token, idHitman) {
    const config = {
      headers: {'Authorization': "Bearer " + token}
    };
    const url = "http://localhost:8080/givenAssignments/"+idHitman;
    return axios.get(url, config); 
  }

  getMyHitmans(token, idHitman) {
    const config = {
      headers: {'Authorization': "Bearer " + token}
    };
    const url = "http://localhost:8080/hitmans/"+idHitman;
    return axios.get(url, config); 
  }
  
  //fecth and updates all the data 
  async fetchData() {
    let hitmanInfo = this.state.hitmanInfo; 
    const token = hitmanInfo.token; 
    const idHitman = hitmanInfo.idHitman; 

    try {
      let assignments = []
      if (this.state.isHitman || this.state.isBoss) {
        let res = await this.getAssignments(token, idHitman);
        assignments = res.data; 
      }

      let givenAssignments = [];
      if (this.state.isBoss) {
        let res = await this.getGivenAssigments(token, idHitman);
        givenAssignments = res.data; 
      }
      
      let myHitmans = []
      if (this.state.isBoss) {
        let res = await this.getMyHitmans(token, idHitman);
        myHitmans = res.data; 
      }
      
      this.setState({assignments, givenAssignments, myHitmans})
    } catch (err) {

    }
  }

  /**
   * sets the login state to true to show the content
   */
  setLogedIn(value, userType) {
    let isBoss = (userType === 'boss');
    let isHitman = (userType === 'hitman');
    let isBigboss = (userType === 'bigboss');
    let info = localStorage.getItem("hitmanInfo"); 
    let hitmanInfo = (info !== "null") ? JSON.parse(info) : {}; 

    this.setState({logedIn: value, isHitman, isBoss, isBigboss, hitmanInfo});
    if (value)
      this.fetchData(); 
  }

  /**
   * Checks if the current token is still valid 
   */
  checkToken() {
    const url = "http://localhost:8080/checkToken";
    let hitmanInfo = this.state.hitmanInfo; 

    return new Promise((resolve, reject) => {
      if (!hitmanInfo) {
        this.setState({logedIn: false});
        resolve(false);
      } else {
        axios.post(url, {token: hitmanInfo.token}).then(res => {
          this.setState({logedIn: res.data.valid}); 
          resolve(res.data.valid);
        }).catch(err => {
          console.log(err); 
          reject(err);
          this.setState({logedIn: false});
        })
      } 
    })
    
  }

  updateAssigmentStatus(status) {
    //update status
    const url = "http://localhost:8080/assignment/status";
    const config = {
        headers: {'Authorization': "Bearer " + this.state.hitmanInfo.token}
    };

    axios.put(url, {idAssignment: this.state.confirmAssignmentId, status: status}, config).then(res => {
      this.setState({ confirmAssignment: false });
      this.fetchData();
      toast.success("I will serve. I will be of service", {
        position: toast.POSITION.TOP_CENTER
      });
    }).catch( err => console.log(err) )
    
  } 

  logout() {
    localStorage.setItem("hitmanInfo", null);
    this.setState({logedIn: false});
  }

  render() {
    if (this.state.logedIn) {
      return (
        <div className="App container">
          <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">"I will serve. I will be of service."</Navbar.Brand>
          <Nav className="mr-auto">
          <Nav.Link href="#home" onClick={() => this.logout()}>Log Out</Nav.Link>
          </Nav>
          </Navbar>

          <h2 className="table-title">My Assignments </h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Assignment Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                  this.state.assignments.map(assignment => {
                    return (
                      <tr key={assignment.id}>
                        <td>{assignment.descripction}</td>
                        <td className={assignment.status}>{assignment.status}</td>
                        <td>
                          <i className="fa fa-check action check" onClick={() => this.setState({confirmAssignment: true, confirmAssignmentId: assignment.id})}></i> 
                          <i className="fa fa-times action fail" onClick={() => this.setState({confirmFailAssignment: true, confirmAssignmentId: assignment.id})} ></i>
                        </td>
                      </tr>
                    )
                  })
              }
              
              {
                (this.state.assignments.length === 0) && <tr><td colSpan={"3"}><h3>No Assignments</h3></td></tr>
              }
            </tbody>

            <SweetAlert
              show={this.state.confirmAssignment}
              title="Did you complete the task?"
              type="info"
              showCancelButton
              onCancel={() => {
                this.setState({ confirmAssignment: false });
              }}
              onConfirm={() => {
                this.updateAssigmentStatus("SUCCESSFUL"); 
                this.setState({confirmAssignment: false})
              }}
            />
            <SweetAlert
              show={this.state.confirmFailAssignment}
              title="Did you FAIL the task?"
              type="info"
              showCancelButton
              onCancel={() => {
                this.setState({ confirmFailAssignment: false });
              }}
              onConfirm={() => {
                this.updateAssigmentStatus("FAILED"); 
                this.setState({confirmFailAssignment: false})
              }}
            />
            <ToastContainer autoClose={2000} position={toast.POSITION.BOTTOM_RIGHT}/>
          </Table>

          <div className="table-title">
            <h2 >Given Assignments </h2>
            <Button variant="primary" className="table-btn"><i className="fa fa-plus"></i> New Assignment</Button>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Hitman Name</th>
                <th>Assignment Description</th>
                <th >Status</th>
              </tr>
            </thead>
            <tbody>
            {
              this.state.givenAssignments.map(assignment => {
                return (
                  <tr key={assignment.id}>
                  <td>{assignment.name}</td>
                  <td>{assignment.descripction}</td>
                  <td className={assignment.status}>{assignment.status}</td>
                </tr>
                )
              })
            }

            {
              (this.state.givenAssignments.length === 0) && <tr><td colSpan={"3"}><h3>No Assignments</h3></td></tr>
            }
            </tbody>
          </Table>

          <h2 className="table-title">My Hitmans </h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {
              this.state.myHitmans.map(hitman => {
                return (
                  <tr>
                    <td>{hitman.name}</td>
                    <td>{hitman.descripction}</td>
                    <td>{hitman.status}</td>
                    <td><i className="fa fa-dead action"></i> <i className="fa fa-dead action"></i>{hitman.hitmanId}</td>
                  </tr>
                );
              })
            }
            
            {
              (this.state.myHitmans.length === 0) && <tr><td colSpan={"4  "}><h3>No Hitmans</h3></td></tr>
            }
            </tbody>
          </Table>

          <div className="table-title">
            <h2 >All Hitmans </h2>
            <Button variant="primary" className="table-btn"><i className="fa fa-plus"></i> Add Boss </Button>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
                <td>@mdo</td>
              </tr>
            </tbody>
          </Table>

          <div className="table-title">
            <h2 >All Bosses </h2>
            <Button variant="primary" className="table-btn"><i className="fa fa-plus"></i> Add Boss </Button>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
                <td>@mdo</td>
              </tr>
            </tbody>
          </Table>
        </div>
      );
    }

    return (<Login onLogin={this.setLogedIn} />)
    
  }
}

export default Home; 