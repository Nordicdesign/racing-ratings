import React, { Component } from 'react'
import * as data from '../data/example.json'

class Homepage extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      sessionIncidents: [],
      // sessionContacts: [],
      dataReady: false
    }
  }

  listDrivers() {
    const rawDrivers = data.rFactorXML.RaceResults.Race.Driver
    const raceDrivers = []

    for (const driver of rawDrivers) {
      raceDrivers.push(driver.Name)
    }
    console.log("drivers", raceDrivers)
    this.setState({
      drivers: raceDrivers
    }, () => {
      this.listIncidents()
    })
  }

  removeDuplicatesBy(keyFn, array) {
    //https://stackoverflow.com/questions/32238602/javascript-remove-duplicates-of-objects-sharing-same-property-value/32238794#32238794
    var mySet = new Set();
    return array.filter(function(x) {
      var key = keyFn(x), isNew = !mySet.has(key);
      if (isNew) mySet.add(key);
      return isNew;
    });
  }

  listIncidents() {
    const sessionIncidents = []
    const sessionContacts = []
    const incidents = data.rFactorXML.RaceResults.Race.Stream.Incident
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc.__text.indexOf(query) !== -1)
    const carContacts = this.removeDuplicatesBy(x => x._et, filterItems)

    for (const driver of this.state.drivers) {
      const result = filterItems.filter(a => a.__text.indexOf(driver) !== -1)
      sessionIncidents.push({
        name: driver,
        incidents: result.length
      })
    }
    for (const driver of this.state.drivers) {
      const result2 = carContacts.filter(a => a.__text.indexOf(driver) !== -1)
      sessionContacts.push({
        name: driver,
        crashes: result2.length
      })
    }

    const merged = [];
    for ( let i=0; i < sessionIncidents.length; i++) {
      merged.push({
        name:sessionIncidents[i].name,
        incidents: sessionIncidents[i].incidents,
        crashes: sessionContacts[i].crashes
      })
    }
    this.setState({
      sessionIncidents: merged,
      dataReady: true
    })
  }

  componentDidMount() {
    this.listDrivers()
  }

  render() {
    // console.log(data.rFactorXML.RaceResults)
    const incidents = data.rFactorXML.RaceResults.Race.Stream.Incident
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc.__text.indexOf(query) !== -1)

    return (
      <div className="wrapper">
        <h1>{data.rFactorXML.RaceResults.ServerName}</h1>
        <h2>{data.rFactorXML.RaceResults.TrackVenue}</h2>
        <div className="content">
          <h3>Incidents</h3>
          {this.state.dataReady ?
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Total incidents</th>
                  <th>Unique contacts</th>
                </tr>
              </thead>
              <tbody>

                {this.state.sessionIncidents.map((incident, index) => {
                  return (
                    <tr key={index}>
                      <td>{incident.name}</td>
                      <td>{incident.incidents}</td>
                      <td>{incident.crashes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table> :
            <p>Loading data</p>}
        </div>
        <h3>Incidents</h3>
        <ul>
        {filterItems.map((driver, index) => {
          return <li key={index}>{driver._et} - {driver.__text}</li>
        })}
        </ul>

      </div>
    )
  }
}

export default Homepage
