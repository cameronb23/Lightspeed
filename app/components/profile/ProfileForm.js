// eslint-disable flowtype/no-weak-types: 1
import _ from 'underscore';
import React from 'react';
import { reduxForm, Field, submit } from 'redux-form';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import { Button, MenuItem, Grid, InputLabel } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import {
  Select,
  TextField,
} from 'redux-form-material-ui';

import { States } from '../../utils/states';
import { Months } from '../../utils/card-expiry';

const styles = () => ({
  tallPopover: {
    maxHeight: 150
  }
});

const required = value => (value == null ? 'Required' : undefined);

const monthList = Months.map(m => ({
  key: m.numeric,
  text: `${m.appended} - ${m.label}`,
  value: m.appended
}));

class ProfileForm extends React.Component {

  props: {
    currentProfile: Object,
    open: boolean,
    pristine: boolean,
    submitting: boolean,
    dispatch: Function,
    reset: Function,
    change: Function,
    initialize: Function,
    handleSubmit: Function,
    handleClose: Function,
    handleDelete: Function,
    classes: Object
  };

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  updateForm() {
    if (this.props.currentProfile) {
      this.props.change('prof', this.props.currentProfile.id);
      Object.keys(this.props.currentProfile).forEach(k => {
        // initialize payment specifically as it contains non-standard objects
        if (k === 'payment') {
          const parsed = parseInt(this.props.currentProfile.payment.expMonth, 10);
          const month = _.findWhere(monthList, { key: parsed });
          const obj = Object.assign({}, this.props.currentProfile[k]);
          obj.expMonth = month.value;
          this.props.change(k, obj);
        } else {
          this.props.change(k, this.props.currentProfile[k]);
        }
      });
      // this.props.initialize(this.props.currentProfile);
    }
  }

  onClickSubmit() {
    console.log('attempting submit');
    this.props.dispatch(submit('profileForm'));
  }

  render() {
    const {
      currentProfile,
      open,
      pristine,
      submitting,
      reset,
      handleSubmit,
      handleClose,
      handleDelete
    } = this.props;

    const stateList = [];

    States.forEach(s => stateList.push({
      key: s.abbreviation,
      text: s.name,
      value: s.abbreviation
    }));

    let currentState = null;

    if (currentProfile != null) {
      currentState = _.findWhere(stateList, { value: currentProfile.state });
    }

    const countries = [{ key: 'USA', text: 'United States', value: 'United States' }];

    return (
      <Dialog
        fullWidth
        onEnter={this.updateForm.bind(this)}
        open={open}
        onRequestClose={handleClose}
      >
        <DialogTitle>Profile: {currentProfile ? currentProfile.title : 'New'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Field
              name="id"
              fullWidth
              component={TextField}
              label="Profile ID"
              disabled
            />

            <br />

            <Grid container spacing={24}>
              <Grid item xs>
                <Field
                  name="firstName"
                  fullWidth
                  component={TextField}
                  label="First Name"
                  validate={required}
                />
              </Grid>
              <Grid item xs>
                <Field
                  name="lastName"
                  fullWidth
                  component={TextField}
                  label="Last Name"
                  validate={required}
                />
              </Grid>
            </Grid>

            <br />

            <Grid container spacing={24}>
              <Grid item xs>
                <Field
                  name="email"
                  fullWidth
                  component={TextField}
                  label="Email address"
                  validate={required}
                />
              </Grid>
              <Grid item xs>
                <Field
                  name="phoneNumber"
                  fullWidth
                  component={TextField}
                  label="Phone number"
                  validate={required}
                />
              </Grid>
            </Grid>

            <br />

            <Grid container spacing={24}>
              <Grid item xs>
                <Field
                  name="address1"
                  fullWidth
                  component={TextField}
                  label="Address line 1"
                  validate={required}
                />
              </Grid>
            </Grid>

            <br />

            <Grid container spacing={24}>
              <Grid item xs>
                <Field
                  name="address2"
                  fullWidth
                  component={TextField}
                  label="Address line 2"
                />
              </Grid>
            </Grid>

            <br />

            <Grid container spacing={24}>
              <Grid item xs>
                <Field
                  name="city"
                  fullWidth
                  component={TextField}
                  label="Town/City"
                  validate={required}
                />
              </Grid>
              <Grid item xs>
                <InputLabel htmlFor="pfst">Select State</InputLabel>
                <Field
                  id="pfst"
                  fullWidth
                  name="state"
                  component={Select}
                  MenuProps={{
                    style: {
                      maxHeight: 48 * 4.5,
                      width: 200
                    }
                  }}
                  label="State"
                  validate={required}
                  value={currentState}
                >
                  {stateList.map(state => (
                    <MenuItem key={state.key} value={state.value}>
                      {state.text}
                    </MenuItem>
                  ))}
                </Field>
              </Grid>
            </Grid>

            <br />

            <Grid container spacing={24}>
              <Grid item xs>
                <Field
                  name="zip"
                  fullWidth
                  component={TextField}
                  label="ZIP/Postal Code"
                  validate={required}
                />
              </Grid>
              <Grid item xs>
                <InputLabel htmlFor="tkcn">Select country</InputLabel>
                <Field
                  id="tkcn"
                  name="country"
                  fullWidth
                  component={Select}
                  autoWidth
                  MenuProps={{
                    style: {
                      maxHeight: 48 * 4.5,
                      width: 200
                    }
                  }}
                  label="Country"
                  validate={required}
                  value={currentState}
                >
                  {countries.map(c => (
                    <MenuItem key={c.key} value={c.value}>
                      {c.text}
                    </MenuItem>
                  ))}
                </Field>
              </Grid>
            </Grid>

            <br />

            <Grid container spacing={24}>
              <Grid item xs>
                <Field
                  name="payment.cardName"
                  fullWidth
                  component={TextField}
                  label="Name on Card"
                  validate={required}
                />
              </Grid>
              <Grid item xs>
                <Field
                  name="payment.cardNumber"
                  fullWidth
                  component={TextField}
                  label="Card Number"
                  validate={required}
                />
              </Grid>
            </Grid>

            <Grid container spacing={24}>
              <Grid item xs>
                <InputLabel htmlFor="pfpexm">Expiration Month</InputLabel>
                <Field
                  id="pfpexm"
                  name="payment.expMonth"
                  component={Select}
                  fullWidth
                  MenuProps={{
                    style: {
                      maxHeight: 48 * 4.5,
                      width: 200
                    }
                  }}
                  validate={required}
                >
                  {monthList.map(c => (
                    <MenuItem key={c.key} value={c.value}>
                      {c.text}
                    </MenuItem>
                  ))}
                </Field>
              </Grid>
              <Grid item xs>
                <Field
                  name="payment.expYear"
                  fullWidth
                  component={TextField}
                  label="Expiration Year"
                  validate={required}
                />
              </Grid>
              <Grid item xs>
                <Field
                  name="payment.cvv"
                  fullWidth
                  component={TextField}
                  label="CVV"
                  validate={required}
                />
              </Grid>
            </Grid>

            <Field
              name="title"
              fullWidth
              component={TextField}
              label="Profile name"
              validate={required}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClickSubmit} color="primary" disabled={pristine || submitting}>
            Save
          </Button>
          <Button
            disabled={pristine || submitting}
            onClick={reset}
          >
            Clear
          </Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    );
  }
}


const ProfileFormStyled = withStyles(styles)(ProfileForm);

export default reduxForm({ // Decorate with redux-form
  form: 'profileForm',
  enableReinitialize: true
})(ProfileFormStyled);
