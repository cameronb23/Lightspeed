// @flow
import React, { Component } from 'react';
import type { Children } from 'react';

import { Sidebar, Menu, Segment, Icon, Button } from 'semantic-ui-react';

export default class App extends Component {
  props: {
    children: Children
  };

  state: Object;

  constructor(props: Object) {
    super(props);

    this.state = {
      sidebarVisible: true
    };
  }

  toggleVisibility = () => this.setState({ sidebarVisible: !this.state.sidebarVisible })

  render() {
    return (
      <Sidebar.Pushable>
        <Sidebar as={Menu} animation="push" width="thin" visible={this.state.sidebarVisible} icon="labeled" vertical borderless>
          <Menu.Item name="home">
            <Icon name="home" />
            Home
          </Menu.Item>
          <Menu.Item name="task-editor">
            <Icon name="pencil" />
            Task Builder
          </Menu.Item>
          <Menu.Item name="tasks">
            <Icon name="list" />
            Tasks
          </Menu.Item>
          <Menu.Item name="settings">
            <Icon name="cogs" />
            Settings
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher>
          <Segment basic>
            <Button basic icon="bars" onClick={this.toggleVisibility} />
            {this.props.children}
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}
