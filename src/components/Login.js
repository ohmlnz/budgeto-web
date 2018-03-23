import React, { Component } from 'react';
import '../styles/Login.css';

class Login extends Component {
  render() {
    return (
      <form className='login-form' onSubmit={this.props.handlerLogin} style={{ 'display': this.props.display? 'none' : 'block' }}>
        <label>Username</label><input name='login' value={this.props.login} type='text' onChange={this.props.handlerChange}/>
        <label>Password</label><input name='password' value={this.props.password} type='password' onChange={this.props.handlerChange}/>
        <input type='submit' value='Submit' />
        <span className='error-message'>{this.props.message}</span>
      </form>
    )
  }
}

export default Login;
