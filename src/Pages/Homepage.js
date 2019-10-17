import React, { Component } from 'react'
import * as data from '../data/example.json'

class Homepage extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      sessionIncidents: [],
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
    }


  )
    // {drivers.map((driver, index) => {
    //   return <li key={index}>{driver.Name}</li>
    // })}
  }

  listIncidents() {
    const sessionIncidents = []
    const incidents = data.rFactorXML.RaceResults.Race.Stream.Incident
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc.__text.indexOf(query) !== -1)

    for (const driver of this.state.drivers) {
      const result = filterItems.filter(a => a.__text.indexOf(driver) !== -1)
      sessionIncidents.push({
        name: driver,
        contacts: result.length
      })
    }
    this.setState({
      sessionIncidents: sessionIncidents,
      dataReady: true
    })

    // filterItems.map((driver, index) => {
    //   return <li key={index}>{driver.__text}</li>
    // })
  }

  componentDidMount() {
    this.listDrivers()
  }

  render() {
    // console.log(data.rFactorXML.RaceResults)

    const incidents = data.rFactorXML.RaceResults.Race.Stream.Incident
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc.__text.indexOf(query) !== -1)

    // console.log("incidents", filterItems)

    return (
      <div className="wrapper">
        <h1>{data.rFactorXML.RaceResults.ServerName}</h1>
        <h2>{data.rFactorXML.RaceResults.TrackVenue}</h2>
        <div className="content">
          <div className="content-drivers">
            <h3>Drivers</h3>
            <ul>
              {this.state.drivers.map((driver, index) => {
                return <li key={index}>{driver}</li>
              })}
            </ul>
          </div>
          <div className="content-incidents">
            <h3>Incidents</h3>
            {this.state.dataReady ?
              <table>
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Contacts</th>
                  </tr>
                </thead>
                <tbody>

                  {this.state.sessionIncidents.map((indident, index) => {
                    return (
                      <tr key={index}>
                        <td>{indident.name}</td>
                        <td>{indident.contacts}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table> :
              <p>Loading data</p>}
          </div>
        </div>
        <hr/>
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
