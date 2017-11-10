// @flow
import React, { Component } from 'react';
import moment from 'moment';

import WebView from 'react-electron-web-view';

import { List, ListItem, ListItemText } from 'material-ui';
import { Button, Grid, Paper, Typography, Avatar, CircularProgress } from 'material-ui';
import { withStyles } from 'material-ui/styles';

// icons:
// web - web solver
// speaker phone - dropday app
// local - bot solver
import { Web, SpeakerPhone, Place } from 'material-ui-icons';

import type { Captcha } from '../globals';

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    s: 'a few seconds',
    ss: '%d seconds',
    m: '%d minutes',
    mm: '%d minutes'
  }
});

const styles = () => ({
  paper: {
    padding: 25
  },
  web: {
    height: '100%'
  }
});

const IconTypes = {
  web: <Web />,
  app: <SpeakerPhone />,
  local: <Place />
};

class CaptchaComponent extends Component {

  props: {
    captchas: Array<Captcha>,
    classes: Object
  };

  state: {
    ready: boolean
  };

  recapInstance: Object;
  webView: Object;

  constructor(props) {
    super(props);

    this.state = {
      ready: false
    };
  }


  render() {
    const { classes } = this.props;

    const captchas = [{
      token: 'aa334abbbfff87333',
      source: 'app',
      expiry: moment().add(45, 'seconds')
    },
    {
      token: 'aa88333',
      source: 'web',
      expiry: moment().add(95, 'seconds')
    },
    {
      token: 'as34555',
      source: 'local',
      expiry: moment().add(5, 'seconds')
    }];

    return (
      <div>
        <Grid container spacing={24}>
          {/* <Grid item xs>
            <Paper className={classes.paper}>
              <Typography type="headline">Live Captchas (Placeholder)</Typography>
              <List>
                {captchas.map(c => (
                  <ListItem key={c.token}>
                    <Avatar>
                      { IconTypes[c.source] }
                    </Avatar>
                    <ListItemText
                      primary={c.token.substring(0, 6)}
                      secondary={moment().to(c.expiry)}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid> */}
          <Grid item xs>
            <Paper className={classes.paper}>
              <Typography type="headline">Captcha solver</Typography>
              <Button color="primary" onClick={this.resetCaptcha.bind(this)}>Manual Reset</Button>
              {!this.state.ready && <CircularProgress />}
              <WebView className={classes.web} src={'http://localhost:9965/captcha?sitekey=6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF&url=packershoes.com'} ref={(view) => { this.webView = view; }} />
              {/* <Recaptcha
                ref={e => { this.recapInstance = e; }}
                verifyCallback={this.verifyToken.bind(this)}
                render="explicit"
                onloadCallback={this.callback.bind(this)}
                sitekey="6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF"
              /> */}
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(CaptchaComponent);
