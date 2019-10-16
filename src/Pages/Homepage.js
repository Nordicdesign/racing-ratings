import React, { Component } from 'react'
import * as data from '../data/example.json'
import jlinq from 'jlinq'

class Homepage extends Component {
  // constructor(props) {
  //   super(props)
  // }

  // {indidents.map((driver, index) => {
  //   return <li key={index}>{driver.Name}</li>
  // })}

  render() {
    console.log("pepe");
    console.log(data.rFactorXML.RaceResults)
    const drivers = data.rFactorXML.RaceResults.Race.Driver
    const incidents = data.rFactorXML.RaceResults.Race.Stream.Incident
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc.__text.indexOf(query) !== -1)

    console.log("incidents", filterItems)

    return (
      <div className="wrapper">
        <h1>{data.rFactorXML.RaceResults.ServerName}</h1>
        <h2>{data.rFactorXML.RaceResults.TrackVenue}</h2>
        <div className="content">
          <div className="content-drivers">
            <h3>Drivers</h3>
            {console.log("the drivers", data.rFactorXML.RaceResults.Race.Driver)}
            <ul>
            {drivers.map((driver, index) => {
              return <li key={index}>{driver.Name}</li>
            })}
            </ul>
          </div>
          <div className="content-incidents">
            <h3>Incidents</h3>
            <ul>
            {filterItems.map((driver, index) => {
              return <li key={index}>{driver.__text}</li>
            })}
            </ul>
          </div>
        </div>

      </div>
    )
  }
}

export default Homepage
