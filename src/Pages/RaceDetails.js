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
      raceId: this.props.match.params.raceId
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
    return (
      <div className="wrapper">
      <h1>Race details</h1>
      <p><Link to="/">Back to homepage</Link></p>
      {this.state.dataReady ?
        <div>
          <h2>{race.name}</h2>
          <p>{race.venue}</p>
          <h3>Drivers</h3>

          <h3>Incidents</h3>
        </div> :
      <p>Loading</p>}
      </div>
    )
  }
}

export default RaceDetails
