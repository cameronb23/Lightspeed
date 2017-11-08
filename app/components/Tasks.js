// @flow
import React, { Component } from 'react';
import { Button, Checkbox } from 'material-ui';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { CircularProgress } from 'material-ui/Progress';
import { Check, Close } from 'material-ui-icons';
import { withStyles } from 'material-ui/styles';
import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';
import { sendStartCommand, sendStopCommand, removeTask } from '../actions/tasks';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  iconSuccess: {
    fill: red
  },
  iconFail: {
    fill: green
  }
});

class Tasks extends Component {
  props: {
    dispatch: Function,
    tasks: Array<Object>,
    classes: Object
  };

  state: {
    loading: boolean,
    selected: Array
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      loading: false,
      selected: []
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

  async handleStopAllTasks() {
    this.setState({
      loading: true
    });

    this.props.tasks.forEach(t => {
      this.props.dispatch(sendStopCommand(t));
    });

    this.setState({
      loading: false
    });
  }

  async handleClearAll() {
    this.setState({
      loading: true
    });

    this.props.tasks.forEach(t => {
      this.props.dispatch(sendStopCommand(t));
    });

    this.props.tasks.forEach(t => {
      this.props.dispatch(removeTask(t.id));
    });

    this.setState({
      loading: false
    });
  }


  // select items
  handleSelectAll(e, items) {
    if (items) {
      const { tasks } = this.props;
      this.setState({
        selected: tasks.map(t => t.id)
      });
      return;
    }

    this.setState({
      selected: []
    });
  }

  render() {
    const { tasks, classes } = this.props;
    return (
      <div>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  onChange={this.handleSelectAll.bind(this)}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map(data => {
              console.log(data);
              let str = data.status;
              let status = null;
              let statusCode = null;

              if (str.startsWith('-')) {
                str = str.substring(1);
                statusCode = -1;
              } else {
                statusCode = parseInt(str.split('-')[0], 10);
              }

              status = str.split('-')[1];

              console.log(`Status: ${status} | Code: ${statusCode}`);

              const error = (statusCode === -1);
              const running = (statusCode === 0);
              const success = (statusCode === 1);

              // row error success
              return (
                <TableRow
                  key={data.id}
                >
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>{data.id}</TableCell>
                  <TableCell>{data.type}</TableCell>
                  <TableCell>{data.url}</TableCell>
                  <TableCell>{data.checkout_profile.title}</TableCell>
                  <TableCell className={classes.centered}>
                    { running && <CircularProgress size={20} /> }
                    { success && !error && <Check className={classes.iconSuccess} /> }
                    { error && !success && <Check className={classes.iconFail} /> }
                  </TableCell>
                  <TableCell>
                    {status}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Button color="primary" onClick={this.handleStartAllTasks.bind(this)}>
          Start Tasks
        </Button>
        <Button color="accent" onClick={this.handleStopAllTasks.bind(this)}>
          Stop Tasks
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(Tasks);
