// @flow
import React, { Component } from 'react';
import { Label, Table, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Tasks extends Component {
  props: {
    tasks: Array<Object>
  };

  render() {
    const { tasks } = this.props;
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Hello</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
      </Table>
    );
  }
}

export default Tasks;
