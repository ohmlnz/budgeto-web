import React, { Component } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import './App.css';

const local = 'https://budgeto-api.herokuapp.com';

const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
'October', 'November', 'December' ];

class App extends Component {
  state = {
    input: '',
    select: 'Rent/Mortgage',
    data: [],
    expenses: [],
    categories: []
  }

  componentDidMount = () => {
    var self = this;

    axios.get(`${local}/db`)
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
        <form onSubmit={this.submit}>
          <h1>Budgeto</h1>
          <input className='input-expense' type="text" onChange={this.change} name='input' value={this.state.input}/>
          <select onChange={this.change} name='select'>
            <option value="Rent/Mortgage">Rent/Mortgage</option>
            <option value="Groceries">Groceries</option>
            <option value="Fast Food/Take out">Fast Food/Take out</option>
            <option value="Internet">Internet</option>
            <option value="Electricity & Gas">Electricity & Gas</option>
            <option value="Cell Phone">Cell Phone</option>
            <option value="Car">Car</option>
            <option value="Gas">Gas</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Clothing">Clothing</option>
            <option value="Transportation">Transportation</option>
            <option value="Home Improvement">Home Improvement</option>
            <option value="Gym">Gym</option>
            <option value="Parking">Parking</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
          <input style={{ display: 'none' }} type="submit" value="Submit" />
          <button className='reset' onClick={this.reset}>Reset!</button>
          <button className='export' onClick={this.toCSV}>Export .csv</button>
          <div className='display-expenses'>
            <h4>Your expenses for {months[new Date().getMonth()]}</h4>
            <div className='wrapper-expenses' style={{ 'text-align': this.state.data.length? 'left' : 'center' }}>
              {this.state.data.length? this.state.data.map((el, i) => (
                <div key={i}>{el[0]} | {el[1]}: <b>${el[2]}</b></div>
              )) : <span>No expenses at the moment</span> }
            </div>
          </div>
        </form>
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
      </div>
    );
  }
}

export default App;
