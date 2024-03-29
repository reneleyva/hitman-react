import React, { useState } from "react";
import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import axios from "axios"; 
import "./Login.css";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(false);


  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function sha512(str) {
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
      return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    });
  }
  
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      let hash = await sha512(password); 
      let data = {email, password: hash}; 
      let res = await axios.post("https://hitmans-backend.herokuapp.com/login", data); 
      const token = res.data.token; 
      const name = res.data.name; 
      const type = res.data.type; 
      const idHitman = res.data.idHitman; 

      let hitmanInfo = {token, name, type, idHitman}; 
      localStorage.setItem("hitmanInfo", JSON.stringify(hitmanInfo));
      props.onLogin(true, type);
    } catch (err) {
      setErrorMsg(true)
      props.onLogin(false);
    }
    
    
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        {errorMsg && <p className="err-msg">Usuario o contraseña incorrecta</p>}
        <FormGroup controlId="email" bssize="large">
          <FormLabel>Email</FormLabel>
          <FormControl
            autoFocus
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId="password" bssize="large">
          <FormLabel>Password</FormLabel>
          <FormControl
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
          />
        </FormGroup>
        <Button block bssize="large" disabled={!validateForm()} type="submit">
          Login
        </Button>
      </form>
    </div>
  );
}