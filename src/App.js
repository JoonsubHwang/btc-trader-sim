import { Route, Switch } from 'react-router-dom';
import React from 'react';
import Homepage from './Homepage';
import Trading from './Trading';
import './App.css';



class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      email: null // if signed in
    }
  }

  setEmail = (email) => {
    this.setState({ email: email });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route exact path='/'>
              <Trading email={this.state.email} setEmail={this.setEmail}></Trading>
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
