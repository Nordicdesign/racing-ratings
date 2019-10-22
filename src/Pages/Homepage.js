import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import * as data from '../data/example.json'
import firebase from 'firebase/app'
import 'firebase/database'
// import 'firebase/storage'
// import '@uppy/core/dist/style.css'
// import '@uppy/dashboard/dist/style.css'
// import { Dashboard } from '@uppy/react'
// import Uppy from '@uppy/core'
// import Tus from '@uppy/tus'

// const uppy = Uppy({
//   id: 'tus',
//   autoProceed: true,
//   restrictions: {
//     maxFileSize: 100000,
//     allowedFileTypes: ['xml']
//   }
// })
// .use(Tus, {
//   id: 'Tus',
//   endpoint: 'http://localhost/data/', // use your tus endpoint here
//   resume: true,
//   autoRetry: true,
//   retryDelays: [0, 1000, 3000, 5000]
// })
//
// uppy.on('complete', result => {
//   console.log('successful files:', result.successful)
//   console.log('failed files:', result.failed)
// })

class Homepage extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      sessionIncidents: [],
      // sessionContacts: [],
      dataReady: false,
      races: null,
    }
    // this.uppy = Uppy()
    //   .use(Dashboard, {
    //     // id: 'Dashboard',
    //     // trigger: '.UppyModalOpenerBtn',
    //     inline: true,
    //     // target: '.DashboardContainer',
    //     // replaceTargetContent: true,
    //     showProgressDetails: true,
    //     note: 'Meh. ',
    //     height: 270,
    //     // metaFields: [
    //     //   { id: 'name', name: 'Name', placeholder: 'file name' },
    //     //   { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' }
    //     // ],
    //     browserBackButtonClose: true
    //   }
    // )
    // Get a reference to the storage service, which is used to create references in your storage bucket
    // let storage = firebase.storage();
    //
    // // Create a storage reference from our storage service
    // let storageRef = storage.ref();
  }

  rateDrivers() {
    const incidents = this.state.sessionIncidents
    const rates = []
    for (const driver of incidents) {
      switch (driver.crashes) {
        case 0:
          rates.push({name: driver.name, ratingChange: "0.15"});
          break;
        case 1:
          rates.push({name: driver.name, ratingChange: "0.05"});
          break;
        case 2:
          rates.push({name: driver.name, ratingChange: "0"});
          break;
        case 3:
          rates.push({name: driver.name, ratingChange: "-0.15"});
          break;
        case 4:
          rates.push({name: driver.name, ratingChange: "-0.25"});
          break;
        default:
          rates.push({name: driver.name, ratingChange: "-0.35"});
      }
    }

    console.log("rate changes",rates);

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
    },() => {
      this.rateDrivers()
    })
  }

  listRaces() {
    firebase.database().ref('/races/rf2/').on('value', function(snapshot) {
      // check if there are any races yet
      if (!snapshot.val()) {
        console.log("there are no races!!! 😱");
      } else { // some races are there
        console.log("we got races");
      }
    });
  }

  componentDidMount() {
    // this.listDrivers()
    this.listRaces()
  }

  // componentWillUnmount () {
  //   this.uppy.close()
  // }

  render() {
    // console.log(data.rFactorXML.RaceResults)
    const incidents = data.rFactorXML.RaceResults.Race.Stream.Incident
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc.__text.indexOf(query) !== -1)

    return (
      <div className="wrapper">
      <h1>List of races</h1>
      <p><Link to="/upload-race">Upload a race</Link></p>
        <ul>
          <li>Something</li>
        </ul>
          <br/>
          <br/>
          <br/>
          <hr/>
          <br/>
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
