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
      fileContent: ''
    }
  }

  parseXML() {
    var parseString = require('xml2js').parseString;
    // Create a reference from a Google Cloud Storage URI
    var xml = storage.refFromURL(this.state.fileURL)
    // console.log("file name", this.state.file);
    // let theFile = storageRef.child(this.state.file).getDownloadURL()
      // .then(function(url) {


      // This can be downloaded directly:
      // var xhr = new XMLHttpRequest();
      // xhr.responseType = 'document';
      // xhr.onload = function(event) {
      //   var xml = xhr.response
      //   // return xml
      //   // console.log(xml.response);
      // };
      // xhr.open('GET', url);
      // // xhr.setRequestHeader("Content-Type", "text/xml");
      // xhr.send();

      // let theDocument = xhr.responseXML;
      // console.log("the file?",theDocument);
    //   if (xhr) {
    // xhr.onreadystatechange = () => {
    //     if (xhr.readyState === 4 && xhr.status === 200) {
    //         let xmlDoc=xhr.responseXML;
    //         let xmlData="";
    //         let x=xmlDoc.getElementsByTagName("name");
    //         for (let i=0;i<x.length;i++)
    //         {
    //             xmlData=xmlData + x[i].childNodes[0].nodeValue + ", ";
    //         }
    //         console.log("the file?",xmlData);
    //     }
    // }
// }
    // }).catch(function(error) {
    //   // Handle any errors
    // })
    var xhr = new XMLHttpRequest();
    var json_obj, status = false;
    xhr.open("GET", this.state.fileURL, true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // var json_obj = JSON.parse(xhr.responseText);
          status = true;
          this.setState({fileContent: xhr.responseText})
          // this.setState({ json_obj },console.log("the actual file", this.state.json_obj));
        } else {
          console.error(xhr.statusText);
        }
      }
    }.bind(this);
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);



    // console.log("the xml file", blob);
    parseString(this.state.fileContent, function (err, result) {
        console.dir(result);
    });
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
        fileURL: url,
        dataReady: true
      }))
  }

  componentDidUpdate() {
    this.state.dataReady && this.parseXML()
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
