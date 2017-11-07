/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CaptchaPage from './containers/CaptchaPage';
import TasksPage from './containers/TasksPage';
import TaskBuilderPage from './containers/TaskBuilderPage';
import ProfilesPage from './containers/ProfilesPage';
import SettingsPage from './containers/SettingsPage';

export default () => (
  <App>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/captcha" component={CaptchaPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/taskbuilder" component={TaskBuilderPage} />
      <Route path="/profiles" component={ProfilesPage} />
      <Route path="/settings" component={SettingsPage} />
    </Switch>
  </App>
);
