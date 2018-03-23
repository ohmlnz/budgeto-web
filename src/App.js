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


class App extends Component {
  state = {
    input: '',
    select: 'Rent/Mortgage',
    login: '',
    password: '',
    data: [],
    expenses: [],
    categories: [],
    display: false
  }

  componentDidMount = () => {
    var self = this;

    const tok = `${API_LOGIN}:${API_PASSWORD}`;
    const hash = Base64.encode(tok);
    const Basic = 'Basic ' + hash;

    axios.get(`${local}/db`, { headers : { 'Authorization' : Basic } })
    .then(function(res) {
      self.setState({
        data: res.data,
        categories: res.data.map(el => el[1]),
        expenses: res.data.map(el => el[2])
      })
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  componentDidUpdate = (prevProps, prevState) => {
    //console.log(prevState)
    //console.log(this.state.expenses)
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

    if (this.state.input.length === 0) {
      return;
    }

    axios.post(`${local}/expenses`, {
        value: this.state.input,
        category: this.state.select
    })
    .then(function() {
      self.setState({
        input: '',
        select: 'Rent/Mortgage'
      })
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  reset = (e) => {
    e.preventDefault();

    axios.get(`${local}/kill`)
      .then(function() {
        console.log('it\'s all gone buddy');
      })
      .catch(function(err) {
        console.log(err);
      })

      window.location = '/';
  }

  login = (e) => {
    e.preventDefault();
    const { login, password } = this.state;

    if (login === API_LOGIN && password === API_PASSWORD) {
      this.setState({
        display: !this.state.display
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
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link);
    link.click();
  }

  render() {
    return (
      <div>
        <Login handlerLogin={this.login} handlerChange={this.change} {...this.state} />
        <form onSubmit={this.submit} style={{ 'display': this.state.display? 'block' : 'none' }}>
          <h1>Budgeto</h1>
          <input className='input-expense' type="text" onChange={this.change} name='input' value={this.state.input}/>
          <select onChange={this.change} name='select'>
            {categories.map((el, i) => (
              <option value={el} key={i}>{el}</option>
            ))}
          </select>
          <input style={{ display: 'none' }} type="submit" value="Submit" />
          <button className='reset' onClick={this.reset}>Reset!</button>
          <button className='export' onClick={this.toCSV}>Export .csv</button>
          <div className='display-expenses'>
            <h4>Your expenses for {months[new Date().getMonth()]}</h4>
            <div className='wrapper-expenses' style={{ 'textAlign': this.state.data.length? 'left' : 'center' }}>
              {this.state.data.length? this.state.data.map((el, i) => (
                <div key={i}>{el[0]} | {el[1]}: <b>${el[2]}</b></div>
              )) : <span>No expenses at the moment</span> }
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
