// @flow
import _ from 'underscore';
import React, { Component } from 'react';

import TaskForm from './TaskBuilderForm';
import { addTask } from '../../actions/tasks';

class TaskBuilder extends Component {
  props: {
    dispatch: Function,
    profiles: Array<Object>
  };

  state: {
    loading: boolean,
    valid: boolean,
    taskType: Object
  };

  form: Object;

  onSubmit(formData: Object) {
    console.log(formData);

    this.props.dispatch(addTask({
      type: formData.type,
      url: formData.url,
      data: {
        keywords: formData.keywords.split(','),
        userAgent: 'blah',
        size: formData.size
      },
      proxies: formData.proxies,
      checkout_profile: _.findWhere(this.props.profiles, { id: formData.profile })
    }));
  }

  render() {
    const { profiles } = this.props;
    return (
      <TaskForm profiles={profiles} onSubmit={this.onSubmit.bind(this)} />
    );
  }
}

export default TaskBuilder;
