// @flow weak

import React from 'react';
import { reduxForm, Field } from 'redux-form';
import { Button, FormGroup, Grid, Paper, Typography, LinearProgress } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import {
  TextField,
} from 'redux-form-material-ui';

import type { AppSettings } from '../../globals';

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
  tallPopover: {
    maxHeight: 150
  }
});

class AppSettingsForm extends React.Component {
  props: {
    app: AppSettings,
    pristine: boolean,
    submitting: boolean,
    change: Function,
    reset: Function,
    handleSubmit: Function,
    classes: Object
  };

  state: {
    loading: boolean
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loading: false
      });
      if (this.props.app) {
        Object.keys(this.props.app).forEach(k => {
          // initialize payment specifically as it contains non-standard objects
          this.props.change(k, this.props.app[k]);
        });
      }
    }, 1500);
  }

  render() {
    const { pristine, submitting, reset, handleSubmit, classes } = this.props;

    const appForm = (
      <form onSubmit={handleSubmit}>

        <Grid container spacing={24}>
          <Grid item xs>
            <Field
              name="captcha_keys.2captcha"
              fullWidth
              component={TextField}
              label="2Captcha Key"
            />
          </Grid>
          <Grid item xs>
            <Field
              name="captcha_keys.anticaptcha"
              fullWidth
              component={TextField}
              label="Anti-Captcha Key"
            />
          </Grid>
        </Grid>

        <Grid container spacing={24}>
          <Grid item xs>
            <Field
              name="captcha_keys.captchasolutions"
              fullWidth
              component={TextField}
              label="CaptchaSolutions Key"
            />
          </Grid>
          <Grid item xs>
            <Field
              name="captcha_keys.deathbycaptcha"
              fullWidth
              component={TextField}
              label="DBC Key"
            />
          </Grid>
        </Grid>

        <br />

        <FormGroup>
          <Button type="submit" color="primary" disabled={pristine || submitting}>
            Submit
          </Button>
          <Button disabled={pristine || submitting} onClick={reset}>
            Clear
          </Button>
        </FormGroup>
      </form>
    );

    const loading = (
      <LinearProgress />
    );

    return (
      <Paper className={classes.root} elevation={4}>
        <Typography type="headline" component="h3">
          App Settings
        </Typography>
        <br />
        { this.state.loading && loading }
        { !this.state.loading && appForm }
      </Paper>
    );
  }
}

const AppSettingsFormStyled = withStyles(styles)(AppSettingsForm);

export default reduxForm({ // Decorate with redux-form
  form: 'appSettingsForm'
})(AppSettingsFormStyled);
