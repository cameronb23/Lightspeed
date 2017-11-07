/* eslint flowtype/no-weak-types: 1 */
// @flow
import React, { Component } from 'react';
import type { Children } from 'react';
import { connect } from 'react-redux';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';

import AppDrawer from '../components/AppDrawer';

import { loadProfiles, loadSettings } from '../utils/cache';
import { setAppSettings } from '../actions/app';
import { setProfiles } from '../actions/profiles';

import { toggleTheme } from '../actions/app';

const styles = theme => ({
  root: {
    flex: 1,
    flexGrow: 1
  },
  header: {
    marginBottom: 70
  }
});

class App extends Component {
  props: {
    children: Children,
    app: {
      theme: Object
    },
    classes: Object,
    dispatch: Function
  };

  async componentDidMount() {
    console.log('Loading profiles...');

    try {
      const app = await loadSettings();
      const profiles = await loadProfiles();

      // TODO: do something with app settings

      console.log('Settings loaded');
      if (app) {
        this.props.dispatch(setAppSettings(app));
      }

      console.log('Profiles loaded');
      console.log(profiles);
      if (profiles.length > 0) {
        this.props.dispatch(setProfiles(profiles));
      }
    } catch (e) {
      console.log(e);
    }
  }

  switchTheme() {
    this.props.dispatch(toggleTheme());
  }

  render() {
    const { classes, app } = this.props;

    const theme = createMuiTheme(app.theme);

    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <div className={classes.root}>
            <div className={classes.header}>
              <AppDrawer theme={this.props.app.theme} handleThemeSwitch={this.switchTheme.bind(this)} />
            </div>
            <div className={classes.content}>
              {this.props.children}
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    app: state.app
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

const AppStyled = withStyles(styles, { withTheme: true })(App);

export default connect(mapStateToProps, mapDispatchToProps)(AppStyled);
