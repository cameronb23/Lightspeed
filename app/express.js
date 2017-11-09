/* eslint-disable no-unused-expressions */
import express from 'express';

try {
  const app = express();

  app.set('view engine', 'ejs');

  app.get('/captcha', (req, res) => {
    res.render('static/captchaHarvester', {
      sitekey: req.params.sitekey,
      url: req.params.url
    });
  });

  app.listen(9965, () => {
    process.stdout.write('Captcha server listening on port 9965');
  });
} catch (e) {
  process.stderr.write('Error: ', e);
}
