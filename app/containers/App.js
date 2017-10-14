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
        <div>
          <Sidebar as={Menu} animation="overlay" width="thin" visible={this.state.sidebarVisible} icon="labeled" vertical borderless>
            <Menu.Item name="home">
              <Icon name="home" />
              Home
            </Menu.Item>
            <Menu.Item name="task-editor">
              <Icon name="pencil" />
              Task Builder
            </Menu.Item>
            <Menu.Item as={Link} name="tasks" to="/tasks">
              <Icon name="list" />
              Tasks
            </Menu.Item>
            <Menu.Item name="settings">
              <Icon name="cogs" />
              Settings
            </Menu.Item>
          </Sidebar>
        </div>
        <Sidebar.Pusher>
          <Segment basic>
            <Divider horizontal>Lightspeed</Divider>
            {this.props.children}
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}
