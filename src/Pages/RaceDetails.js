import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/database'

class RaceDetails extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      sessionIncidents: [],
      dataReady: false,
      raceId: this.props.match.params.raceId,
      race: {
        results: []
      }
    }
  }

  componentDidMount() {
    let that = this
    // this.listRaces()
    firebase.database().ref('/races/' + this.state.raceId).on('value', function(snapshot) {
      // check if there are any races yet
      if (!snapshot.val()) {
        console.log("there is no race!!! 😱");
      } else { // some races are there
        that.setState({
          race: snapshot.val(),
          dataReady: true
        })
      }
    });
  }

  render() {
    let race = this.state.race
    let drivers = race.results.sort((a, b) => parseFloat(a.finish) - parseFloat(b.finish));
    console.log(race);
    return (
      <div className="wrapper">
      <h1>Race details</h1>
      <p><Link to="/">Back to homepage</Link></p>
      {this.state.dataReady ?
        <div>
          <h2>{race.name}</h2>
          <p>{race.venue}</p>
          <h3>Drivers</h3>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Final position</th>
                <th>Grid</th>
              </tr>
            </thead>
            <tbody>

              {drivers.map((driver, index) => {
                return (
                  <tr key={index}>
                    <td>{driver.name}</td>
                    <td>{driver.finish}</td>
                    <td>{driver.gridPosition}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <h3>Incidents</h3>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Total incidents</th>
                <th>Unique contacts</th>
              </tr>
            </thead>
            <tbody>

              {race.incidents.map((incident, index) => {
                return (
                  <tr key={index}>
                    <td>{incident.name}</td>
                    <td>{incident.incidents}</td>
                    <td>{incident.crashes}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div> :
      <p>Loading</p>}
      </div>
    )
  }
}

export default RaceDetails
