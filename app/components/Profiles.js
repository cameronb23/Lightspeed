// @flow
import React, { Component } from 'react';
import { Table, Loader, Icon, Button } from 'semantic-ui-react';

class Profiles extends Component {
  props: {
    dispatch: Function,
    profiles: Array<Object>
  };

  render() {
    const { profiles } = this.props;
    return (
      <div>
      </div>
    );
  }
}

export default Profiles;
