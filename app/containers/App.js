/* eslint flowtype/no-weak-types: 1 */
// @flow
import React, { Component } from 'react';
import type { Children } from 'react';
import { Link } from 'react-router-dom';

import { Sidebar, Menu, Segment, Icon, Button, Divider, Grid } from 'semantic-ui-react';

export default class App extends Component {
  props: {
    children: Children
  };

  state: {
    sidebarVisible: boolean
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      sidebarVisible: true
    };
  }

  toggleVisibility = () => this.setState({ sidebarVisible: !this.state.sidebarVisible })

  render() {
    // <Button basic attached="right" floated="left" icon="bars" onClick={this.toggleVisibility} />
    return (
      <Sidebar.Pushable>
        <Sidebar as={Menu} style={{overflowX: 'visible !important'}} animation="overlay" width="thin" visible={this.state.sidebarVisible} icon="labeled" vertical borderless>
          <Menu.Item name="home">
            <Icon name="home" />
            Home
          </Menu.Item>
          <Menu.Item as={Link} name="task-editor" to="/taskbuilder">
            <Icon name="pencil" />
            Task Builder
          </Menu.Item>
          <Menu.Item as={Link} name="tasks" to="/tasks">
            <Icon name="list" />
            Tasks
          </Menu.Item>
          <Menu.Item as={Link} name="profiles" to="/profiles">
            <Icon name="payment" />
            Profiles
          </Menu.Item>
          <Menu.Item name="settings">
            <Icon name="cogs" />
            Settings
          </Menu.Item>
          <Button basic style={{ position: 'absolute', transform: 'translateX(100%)', top: 20, right: 0 }} attached="right" icon="bars" onClick={this.toggleVisibility} />
        </Sidebar>
        <Sidebar.Pusher>
          <Segment basic>
            <Button basic attached="left" icon="bars" onClick={this.toggleVisibility} />
            <Divider horizontal>Lightspeed</Divider>
            {this.props.children}
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}
