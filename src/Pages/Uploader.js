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
      fileContent: ''
    }
  }

  saveRace() {
    let result = this.state.fileContent.rFactorXML.RaceResults.pop()
    console.log("the data", result);
    let newRace = firebase.database().ref('/races/').push()
    newRace.set({
      timestamp: result.DateTime[0],
      name: result.ServerName[0],
      cars: result.VehiclesAllowed[0],
      fixedSetups: result.FixedSetups[0],
      sim: "rf2",
      venue: result.TrackVenue[0]
    })
    console.log("Race created ✅");

  }

  handleUpload = (e) => {
    let file = e.target.files[0]
    let reader = new FileReader()
    let that = this
    reader.readAsText(file)
    reader.onloadend = () => {
        var xmlData = reader.result;
        var parseString = require('xml2js').parseString;
        parseString(xmlData, function (err, result) {
          console.log(result.rFactorXML.RaceResults[0].TrackVenue)
          that.setState({
            fileContent: result
          }, () => {
            that.saveRace()
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
      </div>
    )
  }
}

export default Uploader
