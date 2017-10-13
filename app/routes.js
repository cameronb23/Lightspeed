/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import TasksPage from './containers/TasksPage';

export default () => (
  <App>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/tasks" component={TasksPage} />
    </Switch>
  </App>
);
