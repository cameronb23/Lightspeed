// @flow
import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import storage from 'electron-json-storage';

export default class Home extends Component {

  handleClick() {
    console.log(storage.getDataPath());
  }
  render() {
    return (
      <Button onClick={this.handleClick.bind(this)} label="Hello" />
    );
  }
}
