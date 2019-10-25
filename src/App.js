import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import './App.scss'
import * as ROUTES from './constants/routes'
import Homepage from './Pages/Homepage'
import Uploader from './Pages/Uploader'
import RaceDetails from './Pages/RaceDetails'
import * as firebase from 'firebase/app'
// import 'firebase/database'
import {firebaseConfig} from './constants/firebase'

if(!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
// import 'firebase/analytics'
// firebase.analytics();


function App() {

  return (
    <div className="App">
      <Router>
        <div className="App">
           <Route exact path={ROUTES.HOME} component={Homepage}/>
           <Route path={ROUTES.UPLOADER} component={Uploader}/>
           <Route path="/race-details/:raceId" component={RaceDetails}/>
        </div>
    </Router>
    </div>
  );
}

export default App;
