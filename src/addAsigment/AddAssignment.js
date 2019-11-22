import React from "react"; 
import "./AddAsignment.css";
import { Button, Form } from "react-bootstrap";
import axios from 'axios'; 
export default class AddAsignment extends React.Component {

    constructor() {
        super();
        this.state ={
            hitman: "",
            description: "", 
            myHitmans: []
        };

        this.handleSelect = this.handleSelect.bind(this);
    }

    getMyHitmans() {
        let info = localStorage.getItem("hitmanInfo"); 
        let hitmanInfo = (info !== "null") ? JSON.parse(info) : {}; 
        const config = {
            headers: {'Authorization': "Bearer " + hitmanInfo.token}
        };
        const url = "https://hitmans-backend.herokuapp.com/hitmans/"+hitmanInfo.idHitman;
        return axios.get(url, config); 
    }

    componentDidMount() {
        this.getMyHitmans().then(res => {
            let hitman = (res.data.length > 0) ? res.data[0].hitmanId : "";
            this.setState({myHitmans: res.data, hitman})
        }).catch(err => console.log(err) )
    }

    handleSelect(evt) {
        this.setState({hitman: parseInt(evt.target.value)})
    } 

    checkData(data) {
        if (data.idHitman === "") {
            alert("Select a Hitman!"); 
            return false; 
        } else if (data.description.length === 0) {
            alert("Add a description!");
            return false; 
        }

        return true; 
    }

    submitForm(evt) {
        evt.preventDefault(); 
        let data = {
            idHitman: this.state.hitman, 
            description: this.state.description
        }

        if (this.checkData(data)) {
            let info = localStorage.getItem("hitmanInfo"); 
            let hitmanInfo = (info !== "null") ? JSON.parse(info) : {}; 
            const config = {
                headers: {'Authorization': "Bearer " + hitmanInfo.token}
            };
            const url = "https://hitmans-backend.herokuapp.com/addAssignment/";
            axios.post(url, data, config).then(() => {
                alert("Added");
                window.location.href = "/"; 
            }).catch(err => console.log(err) ); 
        }
    }

    render () {
        return (
            <Form className="form-assignment">
                <a href="/">Home</a>
                <h2>Add New Asignment</h2>
                <Form.Group >
                    <Form.Label>Hitman</Form.Label>
                    <Form.Control as="select" onChange={this.handleSelect}>
                        {
                            this.state.myHitmans.map(hitman => {
                                return (
                                    <option key={hitman.hitmanId} value={hitman.hitmanId}>{hitman.name}</option>
                                )
                            })
                        }
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows="3" onChange={(evt) => this.setState({description: evt.target.value})}/>
                </Form.Group>
                <Button variant="primary" type="submit" id="submit" onClick={(evt) => this.submitForm(evt)}>
                    Submit
                </Button>
            </Form>
        )
    }
    
}
