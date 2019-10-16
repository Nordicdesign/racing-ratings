import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import './App.scss'
import * as ROUTES from './constants/routes'
import Homepage from './Pages/Homepage'


function App() {
  return (
    <div className="App">
      <Router>
        <div className="App">
           <Route exact path={ROUTES.HOME} component={Homepage}/>
        </div>
    </Router>
    </div>
  );
}

export default App;
