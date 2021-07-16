import { Route, Switch } from 'react-router-dom';
import React from 'react';
import TraderSim from './TraderSim';
import './App.css';



class App extends React.Component {
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Switch>

            <Route exact path='/'>
              <TraderSim></TraderSim>
            </Route>

            <Route render={() => (
                <p>not found</p> // <NotFound />
            )}/>

          </Switch>
        </header>
      </div>
    );
  }
}

export default App;
