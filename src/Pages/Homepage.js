import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/database'

class Homepage extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      sessionIncidents: [],
      dataReady: false,
      races: {},
    }
  }

  listRaces = () => {
    let that = this
    firebase.database().ref('/races/').on('value', function(snapshot) {
      // check if there are any races yet
      if (!snapshot.val()) {
        console.log("there are no races!!! 😱");
      } else { // some races are there
        console.log("we got races");
        that.setState({
          races: snapshot.val(),
          dataReady: true
        }, () => {
          console.log("Races are ready 🏁");
        })
      }
    });
  }

  componentDidMount() {
    this.listRaces()
  }

  render() {
    const races = Object.entries(this.state.races)
    // const races = this.state.races
    console.log(races);
    //
    // {this.state.races.map((race, index) => {
    //   return (
    //     <tr key={index}>
    //       <td>{race.name}</td>
    //       <td>{race.incidents}</td>
    //       <td>{race.crashes}</td>
    //     </tr>
    //   )
    // })}
    return (
      <div className="wrapper">
        <h1>List of races</h1>
        <p><Link to="/upload-race">Upload a race</Link></p>

        <table>
          <thead>
            <tr>
              <th>Race</th>
              <th>Drivers</th>
              <th>Incidents</th>
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
    )
  }
}

export default Homepage
