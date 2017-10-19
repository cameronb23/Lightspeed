// @flow
import React, { Component } from 'react';
import { Table, Loader, Icon, Button } from 'semantic-ui-react';
import { sendStartCommand } from '../actions/tasks';

class Tasks extends Component {
  props: {
    dispatch: Function,
    tasks: Array<Object>
  };

  state: {
    loading: boolean
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      loading: false
    };
  }

  async handleStartAllTasks() {
    this.setState({
      loading: true
    });

    this.props.tasks.forEach(t => {
      this.props.dispatch(sendStartCommand(t));
    });

    this.setState({
      loading: false
    });
  }

  render() {
    const { tasks } = this.props;
    return (
      <div>
        <Loader active={this.state.loading} />
        <Table
          celled
          tableData={tasks}
          headerRow={(
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>URL</Table.HeaderCell>
              <Table.HeaderCell width={1}>Active</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          )}
          footerRow={(
            <Table.Row>
              <Table.HeaderCell colSpan={6}>
                <Button floated="right" icon labelPosition="left" negative size="small">
                  <Icon name="close" /> Clear All
                </Button>
                <Button size="small" positive onClick={this.handleStartAllTasks.bind(this)}>Start All</Button>
                <Button negative size="small">Stop All</Button>
              </Table.HeaderCell>
            </Table.Row>
          )}
          renderBodyRow={data => {
            const status = data.status.split('-');
            const statusCode = parseInt(status[0], 16);

            const error = (statusCode === -1);
            const running = (statusCode === 0);
            const success = (statusCode === 1);

            const icon = error ? 'close' : 'checkmark';
            const color = error ? 'red' : 'green';

            return (
              <Table.Row
                negative={error}
                positive={success}
                key={data.id}
              >
                <Table.Cell>{data.id}</Table.Cell>
                <Table.Cell>{data.type}</Table.Cell>
                <Table.Cell>{data.url}</Table.Cell>
                <Table.Cell>
                  <Loader size="tiny" indeterminate inline="centered" active={running} />
                  { success || error ? <Icon color={color} name={icon} size="medium" /> : null }
                </Table.Cell>
                <Table.Cell>
                  {status[1]}
                </Table.Cell>
              </Table.Row>
            );
          }}
        />
      </div>
    );
  }
}

export default Tasks;
