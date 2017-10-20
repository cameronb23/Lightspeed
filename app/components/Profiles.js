// @flow
import _ from 'underscore';
import React, { Component } from 'react';
import { List, Header, Grid, Segment, Button, Divider } from 'semantic-ui-react';
import { Form, Input, Dropdown } from 'formsy-semantic-ui-react';

import { States } from '../utils/states';
import { Months } from '../utils/card-expiry';

import type { CheckoutProfile } from '../globals';

class Profiles extends Component {
  props: {
    dispatch: Function,
    profiles: Array<CheckoutProfile>
  };

  state: {
    currentItem: ?CheckoutProfile,
    loading: boolean
  };

  form: Object;

  constructor(props: Object) {
    super(props);

    this.state = {
      currentItem: null,
      loading: false
    };
  }

  handleProfileClick(item: CheckoutProfile) {
    this.setState({
      currentItem: item
    });
  }

  onSubmit(formData: Object) {
    if (this.state.currentItem) {
      // update profile
    } else {
      // new profile
    }
  }

  render() {
    const { profiles } = this.props;
    const stateList = [];

    States.forEach(s => stateList.push({
      key: s.abbreviation,
      text: s.name,
      value: s.abbreviation
    }));

    let currentState = null;

    if (this.state.currentItem != null) {
      currentState = _.findWhere(stateList, { value: this.state.currentItem.state });
    }

    const monthList = [];

    Months.forEach(m => monthList.push({
      key: m.numeric,
      text: `${m.appended} - ${m.label}`,
      value: m.appended
    }));

    let currentMonth = null;

    if (this.state.currentItem != null) {
      currentMonth = _.findWhere(monthList, { value: this.state.currentItem.payment.expMonth.toString() });
    }

    return (
      <Grid padded="horizontally">
        <Segment.Group as={Grid.Row} horizontal>
          <Grid.Column as={Segment} width={6} padded>
            <List
              animated
              divided
              verticalAlign="middle"
              link
            >
              {profiles.map(profile => (
                <List.Item
                  key={profile.id}
                  onClick={() => this.handleProfileClick(profile)}
                >
                  <List.Content floated="left">
                    <List.Header as="a">{profile.title}</List.Header>
                  </List.Content>
                  <List.Content floated="right">
                    {profile.address1}, {profile.state}
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Grid.Column>
          <Grid.Column as={Segment} width={10}>
            <Form
              onValidSubmit={this.onSubmit.bind(this)}
              loading={this.state.loading}
              ref={ref => this.form = ref} // eslint-disable-line no-return-assign
            >
              <Header as="h3" textAlign="center">
                Profile: {this.state.currentItem ? this.state.currentItem.title : 'New'}
              </Header>

              <Divider horizontal>Contact Information</Divider>

              <Form.Group widths="equal">
                <Input
                  name="firstName"
                  label="First Name"
                  required
                  validations="isAlpha"
                  value={this.state.currentItem ? this.state.currentItem.firstName : null}
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  required
                  validations="isAlpha"
                  value={this.state.currentItem ? this.state.currentItem.lastName : null}
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Input
                  name="email"
                  label="Email"
                  required
                  validations="isEmail"
                  value={this.state.currentItem ? this.state.currentItem.email : null}
                />
                <Input
                  name="phoneNumber"
                  label="Telephone"
                  required
                  validations="isNumeric"
                  value={this.state.currentItem ? this.state.currentItem.phoneNumber : null}
                />
              </Form.Group>

              <Divider horizontal>Shipping Information</Divider>

              <Input
                name="address1"
                label="Address Line 1"
                required
                value={this.state.currentItem ? this.state.currentItem.address1 : null}
              />
              <Input
                name="address2"
                label="Address Line 2"
                value={this.state.currentItem ? this.state.currentItem.address2 : null}
              />
              <Form.Group widths="equal">
                <Input
                  name="city"
                  label="Town/City"
                  required
                  value={this.state.currentItem ? this.state.currentItem.city : null}
                />
                <Dropdown
                  name="state"
                  placeholder="Select state.."
                  search
                  selection
                  required
                  validationErrors={{ isDefaultRequiredValue: 'You must select a valid state' }}
                  options={stateList}
                  width={6}
                  value={this.state.currentItem && currentState ? currentState.value : null} // TODO: FIXME
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Input
                  name="zip"
                  label="ZIP Code"
                  required
                  value={this.state.currentItem ? this.state.currentItem.zip : null}
                />
                <Dropdown
                  name="country"
                  placeholder="Select country.."
                  required
                  selection
                  options={[{ key: 'USA', text: 'United States', value: 'United States' }]}
                  value={this.state.currentItem ? 'United States' : null}
                />
              </Form.Group>

              <Divider horizontal>Payment Information</Divider>

              <Form.Group widths="equal">
                <Input
                  name="payment.cardName"
                  label="Name on Card"
                  required
                  value={this.state.currentItem ? this.state.currentItem.payment.cardName : null}
                />
                <Input
                  name="payment.cardNumber"
                  label="Card Number"
                  required
                  validations="isNumeric"
                  value={this.state.currentItem ? this.state.currentItem.payment.cardNumber : null}
                />
              </Form.Group>

              <Form.Group widths="equal">
                <Dropdown
                  name="payment.expMonth"
                  placeholder="Month"
                  required
                  selection
                  options={monthList}
                  value={this.state.currentItem && currentMonth ? currentMonth.value : null} // TODO: FIXME
                />
                <Input
                  name="payment.expYear"
                  label="Year"
                  required
                  validations={{ isNumeric: true, maxLength: 4 }}
                  width={10}
                  value={this.state.currentItem ? this.state.currentItem.payment.expYear.toString() : null}
                />
                <Input
                  name="payment.cvv"
                  label="CVV"
                  required
                  validations={{ isNumeric: true, maxLength: 4 }}
                  width={8}
                  value={this.state.currentItem ? this.state.currentItem.payment.cvv : null}
                />
              </Form.Group>

              <Divider />

              <Form.Group inline>
                <Button content="Submit" color="blue" />
                <Button
                  content="Clear"
                  onClick={() => this.form.reset()}
                />
              </Form.Group>
            </Form>
          </Grid.Column>
        </Segment.Group>
      </Grid>
    );
  }
}

export default Profiles;
