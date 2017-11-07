// @flow
import { remote } from 'electron';
import React, { Component } from 'react';

import { NavLink } from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Drawer from 'material-ui/Drawer';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { Home, ModeEdit, Dashboard, Payment, Settings, Palette, Close, CheckCircle } from 'material-ui-icons';

type propTypes = {
  onSwitch: Function,
  theme: {
    palette: Object
  }
}

const SideList = (props: propTypes) => (
  <div style={{ width: 250 }}>
    <List>
      <ListItem button component={NavLink} to="/">
        <ListItemIcon>
          <Home />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItem>

      <ListItem button component={NavLink} to="/captcha">
        <ListItemIcon>
          <CheckCircle />
        </ListItemIcon>
        <ListItemText primary="Captcha Harvesting" />
      </ListItem>

      <ListItem button component={NavLink} to="/taskbuilder">
        <ListItemIcon>
          <ModeEdit />
        </ListItemIcon>
        <ListItemText primary="Task Builder" />
      </ListItem>

      <ListItem button component={NavLink} to="/tasks">
        <ListItemIcon>
          <Dashboard />
        </ListItemIcon>
        <ListItemText primary="Tasks" />
      </ListItem>

      <ListItem button component={NavLink} to="/profiles">
        <ListItemIcon>
          <Payment />
        </ListItemIcon>
        <ListItemText primary="Profiles" />
      </ListItem>

      <ListItem button component={NavLink} to="/settings">
        <ListItemIcon>
          <Settings />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItem>

      <ListItem button onClick={props.onSwitch}>
        <ListItemIcon>
          <Palette />
        </ListItemIcon>
        <ListItemText primary={`Theme: ${props.theme.palette.type}`} />
      </ListItem>
    </List>
  </div>
);

class AppDrawer extends Component {

  props: {
    theme: Object,
    handleThemeSwitch: Function
  };

  state: {
    sidebarVisible: boolean
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      sidebarVisible: false
    };
  }

  toggleVisibility = () => this.setState({ sidebarVisible: !this.state.sidebarVisible })

  closeWindow = () => remote.getCurrentWindow().close();

  // TODO: replace with singular component
  render() {
    return (
      <div>
        <AppBar
          title="Lightspeed"
        >
          <Toolbar>
            <IconButton color="contrast" aria-label="Menu" onClick={this.toggleVisibility.bind(this)}>
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit">
              Lightspeed
            </Typography>
            <IconButton onClick={this.closeWindow.bind(this)} color="contrast" aria-label="Menu">
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          open={this.state.sidebarVisible}
          onRequestClose={() => this.setState({ sidebarVisible: false })}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={() => this.setState({ sidebarVisible: false })}
            onKeyDown={() => this.setState({ sidebarVisible: false })}
          >
            <SideList theme={this.props.theme} onSwitch={this.props.handleThemeSwitch} />
          </div>
        </Drawer>
      </div>
    );
  }
}

export default AppDrawer;
