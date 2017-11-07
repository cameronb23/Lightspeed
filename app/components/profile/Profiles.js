// @flow
import React, { Component } from 'react';

import { Button, Grid, Paper, List, ListItem, ListItemText, Typography } from 'material-ui';

import ProfileForm from './ProfileForm';
import { addProfile, updateProfile, removeProfile } from '../../actions/profiles';

import type { CheckoutProfile } from '../../globals';

class Profiles extends Component {
  props: {
    dispatch: Function,
    profiles: Array<CheckoutProfile>
  };

  state: {
    currentItem: ?CheckoutProfile,
    loading: boolean,
    open: boolean
  };

  form: Object;

  constructor(props: Object) {
    super(props);

    this.state = {
      currentItem: null,
      loading: false,
      open: false
    };
  }

  onSubmit(formData: Object) {
    console.log(formData);
    if (this.state.currentItem != null) {
      // update profile
      const id = this.state.currentItem.id;
      if (id === null) {
        return;
      }

      const profile = Object.assign({}, formData);

      profile.payment.expMonth = parseInt(formData.payment.expMonth, 10);
      profile.payment.expYear = parseInt(formData.payment.expYear, 10);
      profile.payment.cardNumber = formData.payment.cardNumber.split(' ').join('');

      this.props.dispatch(updateProfile(
        id,
        profile
      ));
    } else {
      const newData = Object.assign({}, formData);

      newData.payment.expMonth = parseInt(formData.payment.expMonth, 10);
      newData.payment.expYear = parseInt(formData.payment.expYear, 10);
      newData.payment.cardNumber = formData.payment.cardNumber.split(' ').join('');

      this.props.dispatch(addProfile(
        newData
      ));
    }
  }

  handleDelete() {
    if (this.state.currentItem == null) {
      return;
    }

    const id = this.state.currentItem.id;

    if (id == null) {
      return null;
    }

    this.props.dispatch(removeProfile(
      id
    ));

    this.setState({
      currentItem: null,
      open: false
    });
  }

  handleNewClick() {
    this.setState({
      currentItem: null,
      open: true
    });
  }

  handleOpen(profile: Object) {
    this.setState({
      currentItem: profile,
      open: true
    });
  }

  handleClose() {
    this.setState({
      open: false
    });
  }

  render() {
    const { profiles } = this.props;

    let item;

    if (profiles.length > 0) {
      item = (
        <List>
          {profiles.map(profile => (
            <ListItem button key={profile.id} onClick={() => this.handleOpen(profile)}>
              <ListItemText inset primary={profile.title} secondary={`${profile.address1}, ${profile.state}`} />
            </ListItem>
          ))}
        </List>
      );
    } else {
      item = (
        <Typography style={{ padding: 25 }}>Nothing here! Try creating a profile!</Typography>
      )
    }

    return (
      <div>
        <Grid container spacing={24}>
          <Grid item xs>
            <div style={{ justify: 'flex-end' }}>
              <Button raised color="primary" onClick={this.handleNewClick.bind(this)}>New Profile</Button>
            </div>
            <br />
            <Paper>
              { item }
            </Paper>
          </Grid>
        </Grid>
        <ProfileForm
          dispatch={this.props.dispatch}
          currentProfile={this.state.currentItem}
          open={this.state.open}
          onSubmit={this.onSubmit.bind(this)}
          handleDelete={this.handleDelete.bind(this)}
          handleClose={this.handleClose.bind(this)}
        />
      </div>
    );
  }
}

export default Profiles;
