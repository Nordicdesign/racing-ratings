import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/database'

class Uploader extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      // sessionIncidents: [],
      // sessionContacts: [],
      dataReady: false,
      races: null,
      fileContent: '',
      raceExists: false,
      inputDeleteRace: '',
      ratingChanges: null,
      results: null
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
      let newRace = firebase.database().ref('/races/').push()
      newRace.set({
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
        raceExists: false
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
        let newRace = firebase.database().ref('/races/').push()
        newRace.set({
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
          raceExists: false
        }, () => {
          console.log("Race created ✅");
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
      //   races: 0
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
    const query = "with another vehicle"
    const filterItems = incidents.filter(inc => inc._.indexOf(query) !== -1)
    const carContacts = this.removeDuplicatesBy(x => x._et, filterItems)

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
    // this.state.dataReady && this.parseXML()
  }

  render() {
    return (
      <div className="wrapper">
        <h1>Upload a file</h1>
        <form encType="multipart/form-data" method="post">
          <input
            type="file"
            onChange={this.handleUpload}
          />
        </form>
        <h2>Remove a race</h2>
        <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          value={this.state.inputDeleteRace}
          onChange={this.handleChange}
        />
        <input type="submit" value="Delete" />
        </form>
        { this.state.raceExists && <p>Race already exists in the system</p>}
      </div>
    )
  }
}

export default Uploader
