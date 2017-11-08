// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import Home from '../components/Home';

class HomePage extends Component {
  render() {
    return (
      <Home />
    );
  }
}

export default withRouter(HomePage);
