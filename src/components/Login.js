import React, { Component } from 'react';

class Login extends Component {
  render() {
    return (
      <form onSubmit={this.props.handlerLogin} style={{ 'display': this.props.display? 'none' : 'block' }}>
        <label>Username</label><input name='login' type='text' onChange={this.props.handlerChange}/>
        <label>Password</label><input name='password' type='password' onChange={this.props.handlerChange}/>
        <input type='submit' value='Submit' />
      </form>
    )
  }
}

export default Login;
