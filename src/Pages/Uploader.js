import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'
import FileUploader from "react-firebase-file-uploader";
import {firebaseConfig} from '../constants/firebase'

firebase.initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
let storage = firebase.storage();
// Create a storage reference from our storage service
let storageRef = storage.ref('races/rf2');

class Uploader extends Component {
  constructor(props,context) {
    super(props,context)
    this.state = {
      drivers: [],
      // sessionIncidents: [],
      // sessionContacts: [],
      dataReady: false,
      races: null,
      file: '',
      fileURL: '',
      progress: 0,
    }
  }

  handleUploadStart = () => {
    this.setState({
      progress:0
    })
  }

  handleUploadSuccess = filename => {
    this.setState({
      progress: 100,
      file: filename,
    })
    storageRef.child(filename).getDownloadURL()
      .then(url => this.setState({
        fileURL: url
      }))
  }



  componentDidMount() {

  }

  render() {
    console.log(this.state);
    return (
      <div className="wrapper">
      <h1>Upload a race</h1>
      <FileUploader
        accept=".xml"
        name="race-xml"
        storageRef={storageRef}
        onUploadStart={this.handleUploadStart}
        onUploadSuccess={this.handleUploadSuccess}
      />
      { this.state.progress > 0 && <progress id="file" max="100" value={this.state.progress}> 70% </progress>}

      </div>
    )
  }
}

export default Uploader
