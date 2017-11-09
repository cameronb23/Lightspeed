// eslint-disable flowtype/no-weak-types: 1

import React from 'react';
import { reduxForm, Field } from 'redux-form';
import { Button, MenuItem, FormGroup, Grid, Paper, Typography, InputLabel } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import {
  Select,
  TextField,
} from 'redux-form-material-ui';

import taskSizeOptions from '../../utils/sizing';

const taskTypeOptions = [
  {
    key: 'shpfy', text: 'Shopify', value: 'SHOPIFY'
  },
  {
    key: 'preme', text: 'Supreme US', value: 'SUPREME_US'
  }
];

const keywordDescriptor = 'Enter keywords here separated by a comma. Negative keywords supported.';
const proxyDescriptor = 'Enter proxies here, separated by a new line';


const urlPattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/; // eslint-disable-line no-useless-escape

const required = value => (value == null ? 'Required' : undefined);
const isUrl = value => (urlPattern.test(value) ? undefined : 'Invalid URL');

type propTypes = {
  profiles: Array,
  pristine: boolean,
  submitting: boolean,
  reset: Function,
  handleSubmit: Function,
  classes: Object
};

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
  profileSelect: {
    width: 150
  }
});

const TaskForm = (props: propTypes) => {
  const { profiles, pristine, submitting, reset, handleSubmit, classes } = props;
  const opts = [];

  profiles.forEach(p => {
    opts.push({
      key: p.id,
      text: p.title,
      value: p.id
    });
  });

  return (
    <Paper className={classes.root} elevation={4}>
      <Typography type="headline" component="h3">
        New Task
      </Typography>
      <br />
      <form onSubmit={handleSubmit}>
        <Grid container spacing={24}>
          <Grid item xs>
            <InputLabel htmlFor="tktp">Select task type</InputLabel>
            <Field id="tktp" name="type" fullWidth placeholder="Select task type" component={Select} label="Select task type" validate={required}>
              {taskTypeOptions.map(type => (
                <MenuItem key={type.key} value={type.value}>
                  {type.text}
                </MenuItem>
              ))}
            </Field>
          </Grid>
          <Grid item xs>
            <Field
              name="url"
              fullWidth
              component={TextField}
              label="Task URL"
              validate={isUrl}
            />
          </Grid>
          <Grid item xs>
            <InputLabel htmlFor="tksz">Select desired size</InputLabel>
            <Field id="tksz" name="size" fullWidth component={Select} label="Select desired size" validate={required}>
              {taskSizeOptions.map(type => (
                <MenuItem key={type.key} value={type.value}>
                  {type.text}
                </MenuItem>
              ))}
            </Field>
          </Grid>
        </Grid>

        <br />

        <Field
          name="keywords"
          fullWidth
          component={TextField}
          label={keywordDescriptor}
          validate={required}
        />

        <br />

        <Field
          name="proxies"
          fullWidth
          component={TextField}
          multiline
          rows={8}
          label={proxyDescriptor}
        />

        <br />
        <br />

        <InputLabel htmlFor="tkpf">Select checkout profile</InputLabel>
        <br />
        <Field id="tkpf" name="profile" component={Select} label="Checkout profile" validate={required} className={classes.profileSelect}>
          {opts.map(p => (
            <MenuItem key={p.key} value={p.value}>
              {p.text}
            </MenuItem>
          ))}
        </Field>

        <FormGroup>
          <Button type="submit" color="primary" disabled={pristine || submitting}>
            Submit
          </Button>
          <Button disabled={pristine || submitting} onClick={reset}>
            Clear
          </Button>
        </FormGroup>
      </form>
    </Paper>
  );
};

const TaskFormStyled = withStyles(styles)(TaskForm);

export default reduxForm({ // Decorate with redux-form
  form: 'taskBuilderForm'
})(TaskFormStyled);
