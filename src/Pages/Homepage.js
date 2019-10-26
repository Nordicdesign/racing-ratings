import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/database'

class Homepage extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: {},
      sessionIncidents: [],
      dataReady: false,
      races: {},
    }
  }

  loadData = () => {
    let that = this
    firebase.database().ref('/').on('value', function(snapshot) {
      // check if there are any races yet
      if (!snapshot.val()) {
        console.log("there is no data!!! 😱");
      } else { // some races are there
        let data = snapshot.val()
        that.setState({
          races: data.races,
          drivers: data.drivers,
          dataReady: true
        }, () => {
          console.log("Data is ready 🏁");
        })
      }
    });
  }

  componentDidMount() {
    this.loadData()
  }

  render() {
    const races = Object.entries(this.state.races)
    let drivers = Object.entries(this.state.drivers)
    drivers = drivers.sort((a, b) => parseFloat(b[1].safetyRating) - parseFloat(a[1].safetyRating))
    return (
      <div className="wrapper">

        <h1>Exiled Drivers List</h1>
        <p><Link to="/upload-race">Upload a race</Link></p>
        <div className="home">
          <div>
            <h2>Drivers</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Races</th>
                  <th>Safety Rating</th>
                </tr>
              </thead>
              <tbody>
              {drivers.map((driver, index) => {
                return (
                  <tr key={index}>
                    <td>{driver[1].name}</td>
                    <td>{driver[1].races.length}</td>
                    <td>{driver[1].safetyRating.toFixed(2)}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>

          <div>
            <h2>List of races</h2>
            <table>
              <thead>
                <tr>
                  <th>Race</th>
                  <th>Drivers</th>
                  <th>Contacts</th>
                </tr>
              </thead>
              <tbody>
              {races.map((race, index) => {
                return (
                  <tr key={index}>
                    <td><Link to={`/race-details/` + race[0]}>{race[1].name}</Link></td>
                    <td>{race[1].drivers.length}</td>
                    <td>{race[1].incidents.length}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default Homepage
