// @flow
import _ from 'underscore';
import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Input, TextArea, Checkbox, Dropdown } from 'formsy-semantic-ui-react';
import { addTask } from '../actions/tasks';

const taskTypeOptions = [
  {
    key: 'shpfy', text: 'Shopify', value: 'SHOPIFY'
  },
  {
    key: 'preme', text: 'Supreme US', value: 'SUPREME_US'
  }
];

const taskSizeOptions = [
  { key: '9M', text: 'US 9', value: '9_MENS_US' },
  { key: '9.5M', text: 'US 9.5', value: '9.5_MENS_US' },
  { key: '10M', text: 'US 10', value: '10_MENS_US' },
  { key: '10.5M', text: 'US 10.5', value: '10.5_MENS_US' },
  { key: '11M', text: 'US 11', value: '11_MENS_US' },
  { key: '11.5M', text: 'US 11.5', value: '11.5_MENS_US' }
];

const keywordDescriptor = 'Enter keywords here separated by a comma. + and - supported.';
const proxyDescriptor = 'Enter proxies here, separated by a new line';

class TaskBuilder extends Component {
  props: {
    dispatch: Function,
    tasks: Array<Object>,
    profiles: Array<Object>
  };

  state: {
    loading: boolean
  };

  form: Object;

  constructor(props: Object) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onSubmit(formData: Object) {
    this.setState({
      loading: true
    });

    console.log(formData);

    setTimeout(() => {
      this.props.dispatch(addTask({
        type: formData.type,
        url: formData.url,
        data: {
          keywords: formData.keywords,
          userAgent: 'blah'
        },
        proxies: formData.proxies,
        checkout_profile: _.findWhere(this.props.profiles, { id: formData.profile })
      }));

      this.setState({
        loading: false
      });
    }, 1500);
  }

  render() {
    const { profiles } = this.props;
    const opts = [];

    profiles.forEach(p => {
      opts.push({
        key: p.id,
        text: p.title,
        value: p.id
      });
    });

    return (
      <Form
        onValidSubmit={this.onSubmit.bind(this)}
        loading={this.state.loading}
        ref={ref => this.form = ref} // eslint-disable-line no-return-assign
      >
        <Form.Group widths="equal">
          <Dropdown
            name="type"
            placeholder="Select..."
            selection
            required
            validationErrors={{ isDefaultRequiredValue: 'You must select a valid task type' }}
            options={taskTypeOptions}
          />

          <Input
            name="url"
            label="Task URL"
            required
            validations="isUrl"
            validationError="Please input a valid URL."
          />

          <Dropdown
            name="size"
            placeholder="Select size..."
            search
            selection
            required
            validationErrors={{ isDefaultRequiredValue: 'You must select a valid task size to run for' }}
            options={taskSizeOptions}
          />
        </Form.Group>
        <Input
          name="keywords"
          placeholder={keywordDescriptor}
          label="Keywords"
        />
        <TextArea
          name="proxies"
          placeholder={proxyDescriptor}
          label="Proxies"
        />
        <Checkbox
          name="singleCheckout"
          label="Single checkout only"
          disabled
        />
        <Dropdown
          name="profile"
          placeholder="Select checkout profile"
          selection
          required
          validationErrors={{ isDefaultRequiredValue: 'You must select a valid checkout profile' }}
          options={opts}
        />
        <Form.Group inline>
          <Button content="Submit" color="blue" />
          <Button
            content="Clear"
            onClick={() => this.form.reset()}
          />
        </Form.Group>
      </Form>
    );
  }
}

export default TaskBuilder;
