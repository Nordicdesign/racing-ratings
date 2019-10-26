import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/database'
import { Redirect } from "react-router-dom";


class Uploader extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      dataReady: false,
      races: null,
      fileContent: '',
      raceExists: false,
      inputDeleteRace: '',
      ratingChanges: null,
      results: null,
      toDashboard: false,
      raceKey: null,
      existingDrivers: null,
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  saveRace() {
    let result = this.state.fileContent.rFactorXML.RaceResults.pop()
    console.log(result.Race[0]);
    // const rawDrivers = result.Race[0].Driver
    // const raceDrivers = []
    //
    // for (const driver of rawDrivers) {
    //   raceDrivers.push(driver.Name[0])
    // }
    if (this.state.races === null) {
      let newRaceKey = firebase.database().ref('/races/').push().key
      firebase.database().ref(`/races/${newRaceKey}/`).set({
        timestamp: result.Race[0].DateTime[0],
        name: result.ServerName[0],
        cars: result.VehiclesAllowed[0],
        fixedSetups: result.FixedSetups[0],
        sim: "rf2",
        venue: result.TrackVenue[0],
        drivers: this.state.drivers,
        ratingChanges: this.state.ratingChanges,
        incidents: this.state.sessionIncidents,
        results: this.state.results
      })
      console.log("Race created ✅");
      this.setState({
        raceExists: false,
        raceKey: newRaceKey,
      })
    }
    else {
      let existingRaces = this.state.races
      existingRaces = Object.entries(existingRaces)
      console.log("what we want to match", result.DateTime[0]);
      let raceExists = false
      // check its not a duplicate
      existingRaces.map((race) => {
        if (race[1].timestamp === result.Race[0].DateTime[0]) {
          raceExists = true
          this.setState({
            raceExists: true
          })
        }
        return raceExists
      })

      // considering we have not found the race
      if (!raceExists) {
        // console.log("check", result.Race);
        // add it to the database
        let newRaceKey = firebase.database().ref('/races/').push().key
        firebase.database().ref(`/races/${newRaceKey}/`).set({
          timestamp: result.Race[0].DateTime[0],
          name: result.ServerName[0],
          cars: result.VehiclesAllowed[0],
          fixedSetups: result.FixedSetups[0],
          sim: "rf2",
          venue: result.TrackVenue[0],
          drivers: this.state.drivers,
          ratingChanges: this.state.ratingChanges,
          incidents: this.state.sessionIncidents,
          results: this.state.results
        })
        this.setState({
          raceExists: false,
          raceKey: newRaceKey,
          toDashboard: true   // <=====================================
        }, () => {
          console.log("Race created ✅");
          this.processDrivers()
        })

      }
      else {
        console.log("Race already exists, all my work is done");
      }

      // add first driver
      // let firstDriver = firebase.database().ref('/drivers/').push()
      // firstDriver.set({
      //   name: "Bob",
      //   safetyRating: 2.50,
      // })
    }
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
    this.setState({
      ratingChanges: rates
    }, () => {
      this.saveRace()
    })

  }

  listDrivers() {
    // const rawDrivers = data.rFactorXML.RaceResults.Race.Driver
    const theFile = this.state.fileContent
    const rawDrivers = theFile.rFactorXML.RaceResults[0].Race[0].Driver
    const raceDrivers = []
    const results = []

    for (const driver of rawDrivers) {
      raceDrivers.push(driver.Name[0])
      results.push({
        name: driver.Name[0],
        gridPosition: driver.ClassGridPos[0],
        finish: driver.ClassPosition[0]
      })
    }
    this.setState({
      drivers: raceDrivers,
      results: results
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
    // const incidents = data.rFactorXML.RaceResults.Race.Stream.Incident
    let incidents = this.state.fileContent.rFactorXML.RaceResults[0].Race[0].Stream[0].Incident
    incidents = Object.values(incidents)
    // console.log("total bonkers list", incidents)
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc._.indexOf(query) !== -1)
    // console.log("initial filter", filterItems)
    const carContacts = this.removeDuplicatesBy(x => x.manolo.et, filterItems)
    // console.log("final crashes", carContacts)
    // console.log(this.state.drivers);
    for (const driver of this.state.drivers) {
      const result = filterItems.filter(a => a._.indexOf(driver) !== -1)
      sessionIncidents.push({
        name: driver,
        incidents: result.length
      })
    }
    for (const driver of this.state.drivers) {
      const result2 = carContacts.filter(a => a._.indexOf(driver) !== -1)
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

  handleUpload = (e) => {
    let file = e.target.files[0]
    let reader = new FileReader()
    let that = this
    reader.readAsText(file)
    reader.onloadend = () => {
        var xmlData = reader.result;
        var parseString = require('xml2js').parseString;
        parseString(xmlData, {attrkey: "manolo"}, function (err, result) {
          that.setState({
            fileContent: result
          }, () => {
            console.log(that.state.fileContent);
            that.listDrivers()
          })
        })
    }
  }

  loadRaces = () => {
    let that = this;
    firebase.database().ref('/races/').on('value', function(snapshot) {
      that.setState({
        races: snapshot.val()
      }, () => {
        console.log(that.state.races);
      })
    })
    firebase.database().ref('/drivers/').on('value', function(snapshot) {
      that.setState({
        existingDrivers: snapshot.val()
      })
    });
  }

  handleChange(event) {
    this.setState({inputDeleteRace: event.target.value});
  }

  handleSubmit(event) {
    // console.log("delete some race", );
    firebase.database().ref('/races/' + this.state.inputDeleteRace).remove()
  }

  componentDidMount() {
    this.loadRaces()
  }

  updateDriver(name,r,k,driverKey) {
    console.log(`found duplicate, update ${name} with race ${k} and rating ${r}`);

    let driverToUpdate = {}
    firebase.database().ref('/drivers/' + driverKey).on('value', function(snapshot) {
      driverToUpdate = snapshot.val()
    })
    driverToUpdate.races.push(k)
    let newSR = driverToUpdate.safetyRating + parseFloat(r)

    firebase.database().ref('/drivers/' + driverKey).update({
      races: driverToUpdate.races,
      safetyRating: newSR
    })
  }

  addDriver(name,r,k) {
    console.log(`No duplication, add ${k} to ${name} with rating ${r}`);

    // add driver
    let newDriver = firebase.database().ref('/drivers/').push()
    let sR = 2.50 + parseFloat(r)
    newDriver.set({
      name: name,
      safetyRating: sR,
      races: [k]
    })
  }

  processDrivers() {
    // loop the drivers ON THIS RACE
    for (let driver of this.state.drivers) {
      // is this stays as false, add the new driver, otherwise update
      let duplicated = false
      // get the rating change
      let ratingChange = this.state.ratingChanges.find((d) => {
        return d.name === driver
      })
      // now loop all the exiting drivers
      let driverKey = ''
      let existingDrivers = Object.entries(this.state.existingDrivers)
      existingDrivers.forEach(e => {
        if (e[1].name === driver) {
          duplicated = true
          driverKey = e[0]
        }
      })
      // add or update it
      duplicated ? this.updateDriver(driver,ratingChange.ratingChange,this.state.raceKey, driverKey) : this.addDriver(driver,ratingChange.ratingChange, this.state.raceKey)
      // loop ends
    }
  }

  render() {
    if (this.state.toDashboard === true) {
      return <Redirect to='/' />
    }

    return (
      <div className="wrapper">
        <h1>Upload a file</h1>
        <form encType="multipart/form-data" method="post">
          <input
            type="file"
            onChange={this.handleUpload}
          />
        </form>
        { this.state.raceExists && <p>Race already exists in the system</p>}
        <h2>Remove a race</h2>
        <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          value={this.state.inputDeleteRace}
          onChange={this.handleChange}
        />
        <input type="submit" value="Delete" />
        </form>

        <p><Link to="/">Back to homepage</Link></p>
      </div>
    )
  }
}

export default Uploader
