import './App.css';
import { Route, Switch } from 'react-router-dom';
import Homepage from './Homepage';
import Trading from './Trading';
import { Component } from 'react';

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route exact path='/' component={Homepage}/>
            <Route exact path='/trading' component={Trading} />
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
