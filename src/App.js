import './App.css';
import { Route, Switch } from 'react-router-dom';
import Homepage from './Homepage';
import Trading from './Trading';

function App() {

  // return
  return (
    <div className="App">
      <header className="App-header">
        <Switch>
          <Route exact path='/' render={() => (
            <Homepage></Homepage>
          )} />
          <Route exact path='/trading' render={() => (
            <Trading></Trading>
          )} />
          <Route render={() => (
              <p>not found</p> // <NotFound />
          )}/>
        </Switch>
      </header>
    </div>
  );
}

export default App;
