import React, { Component } from 'react';
import axios from 'axios';
import Base64 from 'base-64';
import { Pie } from 'react-chartjs-2';
import Login from './components/Login';
import { months } from './data/months.js';
import { categories } from './data/categories.js';
import './App.css';

const API_LOGIN = process.env.REACT_APP_BUDGETO_API_LOGIN;
const API_PASSWORD = process.env.REACT_APP_BUDGETO_API_PASSWORD;
const local = 'https://budgeto-api.herokuapp.com';
//const local = 'http://localhost:4000';
const token = `${API_LOGIN}:${API_PASSWORD}`;
const hash = Base64.encode(token);
const Basic = 'Basic ' + hash;

class App extends Component {
  state = {
    input: '',
    select: 'Rent/Mortgage',
    login: '',
    password: '',
    data: [],
    expenses: [],
    categories: [],
    display: false,
    message: ''
  }

  componentDidMount = () => {
    this.fetchData();
  }

  combineArrays = (arr) => {
    for (var i = arr.length-1; 0 <= i; i--) {
      if (i > 0) {
        if (arr[i][1] === arr[i-1][1]) {
          arr[i-1][2] += arr[i][2];
          arr[i][2] = 0;
        }
      }
    }
    return arr.filter(el => el[2] > 0);
  }

  fetchData = () => {
    var self = this;

    axios.get(`${local}/db`, { headers : { 'Authorization' : Basic } })
    .then(function(res) {
      self.setState({
        data: self.combineArrays(res.data.sort()),
        categories: res.data.map(el => el[1]),
        expenses: res.data.map(el => el[2])
      })
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  change = (e) => {
    const target = e.target;

    this.setState({
      [target.name] : target.value
    });
  }

  submit = (e) => {
    var self = this;

    e.preventDefault();

    if (this.state.input.length === 0 || isNaN(this.state.input)) {
      return this.setState({ message: 'Please enter a valid input.'});
    }

    axios.post(`${local}/expenses`, {
        value: this.state.input,
        category: this.state.select
    }, { headers : { 'Authorization' : Basic } })
    .then(function() {
      self.setState({
        input: '',
        message: ''
      })
      self.fetchData();
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  reset = (e) => {
     e.preventDefault();

    axios.get(`${local}/kill`, { headers : { 'Authorization' : Basic } })
      .then(function() {
        console.log('it\'s all gone buddy');
      })
      .catch(function(err) {
        console.log(err);
      })

      this.fetchData();
  }

  login = (e) => {
    e.preventDefault();
    const { login, password } = this.state;

    if (login === API_LOGIN && password === API_PASSWORD) {
      this.setState({
        display: !this.state.display,
        message: ''
      })
    } else {
      this.setState({
        message: 'Wrong password. Try again.',
        login: '',
        password: ''
      })
    }
  }

  toCSV = (e) => {
    e.preventDefault();

    if (this.state.data.length === 0) {
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    this.state.data.forEach(function(rowArray){
       let row = rowArray.join(",");
       csvContent += row + "\r\n";
    });

    let spreadsheet = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", spreadsheet);
    link.setAttribute("download", `expenses_${months[new Date().getMonth()].toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
  }

  render() {
    return (
      <div>
        <Login handlerLogin={this.login} handlerChange={this.change} {...this.state} />
        <form onSubmit={this.submit} style={{ 'display': this.state.display? 'block' : 'none' }}>
          <h1>Budgeto</h1>
          <input className='input-expense' type="text" onChange={this.change} name='input' placeholder="Enter value and press enter" value={this.state.input}/>
          <select onChange={this.change} name='select'>
            {categories.map((el, i) => (
              <option value={el} key={i}>{el}</option>
            ))}
          </select>
          <input style={{ display: 'none' }} type="submit" value="Submit" />
          <button className='reset' onClick={this.reset}>Reset</button>
          <button className='export' onClick={this.toCSV}>Export</button>
          <span className='error-message'>{this.state.message}</span>
          <div className='display-expenses'>
            <h4>Your expenses for {months[new Date().getMonth()]}</h4>
            <div className='wrapper-expenses'>
              {this.state.data.length?
                this.state.data.map((el, i) => (
                 <tr key={i}>
                   <td>{el[0]}</td>
                   <td>{el[1]}</td>
                   <td><b>${el[2]}</b></td>
                 </tr>
               )) : <span>No expenses at the moment</span>}
            </div>
          </div>
          <Pie
            options={{
                legend: {
                    display: false
                }
            }}
            data={{
              labels: this.state.categories,
            	datasets: [{
            		data: this.state.expenses,
            		backgroundColor: [
                  '#FF5733',
                  '#DF4C2D',
                  '#BF4126',
                  '#9F3620',
                  '#802B1A',
                  '#602113',
                  '#40160D'
            		],
            		hoverBackgroundColor: [
                  '#FF5733',
                  '#DF4C2D',
                  '#BF4126',
                  '#9F3620',
                  '#802B1A',
                  '#602113',
                  '#40160D'
            		]
            	}]
            }}
            width={5}
          	height={1}
          />
        </form>
      </div>
    );
  }
}

export default App;
