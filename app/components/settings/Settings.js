// @flow
import React, { Component } from 'react';

import { updateSettings } from '../../actions/app';
import SettingsForm from './SettingsForm';

class TaskBuilder extends Component {
  props: {
    dispatch: Function,
    app: Object
  };

  form: Object;

  onSubmit(formData: Object) {
    console.log(formData);
    this.props.dispatch(updateSettings(
      formData
    ));
  }

  render() {
    return (
      <SettingsForm app={this.props.app} onSubmit={this.onSubmit.bind(this)} />
    );
  }
}

export default TaskBuilder;
