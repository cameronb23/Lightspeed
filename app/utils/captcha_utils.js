//const request = require('request-promise');
import request from 'request-promise';
//const Config = require('./config.json');

const Config = {
  task: {
    retryTimeout: 10,
    captchaService: "anticap"
  },
  captcha: {
    '2captcha': {
      apiKey: "XXX",
      refreshRate: 3
    },
    anticap: {
      apiKey: "XXX",
      refreshRate: 3
    }
  }
}

// http://user:pass@ip:port
function getProxyDetails(proxystr) {
  proxystr = proxystr.split('://')[1];
  let obj = {};

  if(proxystr.split('@').length > 0) {
    let up = proxystr.split('@')[0];
    let ipp = proxystr.split('@')[1];
    obj.user = up.split(':')[0];
    obj.pass = up.split(':')[1];
    obj.ip = ipp.split(':')[0];
    obj.port = ipp.split(':')[1];
  } else {
    obj.ip = proxystr.split(':')[0];
    obj.port = proxystr.split(':')[1];
  }

  return obj;
}

module.exports.solve = (sitekey, url, proxy=undefined) => {
  // find captcha service
  // then we need a captcha response
  switch(Config.task.captchaService) {
    case '2captcha':
      return solve2Cap(sitekey, url);
      break;
    case 'anticap':
      return solveAntiCap(sitekey, url, proxy)
      break;
    default:
      return solve2Cap(sitekey, url);
      break;
  }
}

function solve2Cap(sitekey, productUrl) {
  //console.log("Retrieving captcha solve from service: 2Captcha");

  let apiKey = Config.captcha['2captcha'].apiKey;
  let refreshRate = Config.captcha['2captcha'].refreshRate;

  let url = `http://2captcha.com/in.php?` +
             `key=${apiKey}&` +
             `method=userrecaptcha&` +
             `googlekey=${sitekey}&` +
             `pageurl=${productUrl}`;
  return new Promise((resolve, reject) => {
    // submit request for the captcha ID
    request.post(url)
    .then((body) => {
      if(body.startsWith("OK|")) {
        let reqKey = body.split('OK|')[1].trim();

        let resUrl = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${reqKey}`;

        // we will check every 3 seconds
        let tId = setInterval(() => {
          request(resUrl)
          .then((body) => {
            if(body.startsWith("CAPCHA_NOT_READY")) {
              return;
            } else if(body.startsWith("OK|")) {
              let response = body.split('OK|')[1].trim();

              if(tId) { clearInterval(tId) }

              return resolve(response);
            } else {
              // only called if they couldnt solve or id is incorrect.
              if(tId) { clearInterval(tId) }
              return reject("[2Captcha] Unable to get solved captcha: " + body);
            }
          })
          .catch((err) => {
            return;
          })
        }, refreshRate * 1000);
      } else {
        return reject("[2Captcha] Error making request for captcha ID: " + body);
      }
    })
    .catch((err) => {
      return reject("[2Captcha] Error making request to get captcha solved.");
    })
  });
}


function solveAntiCap(sitekey, productUrl, proxy=undefined) {
  console.log("Retrieving captcha solve from service: AntiCaptcha");

  let apiKey = Config.captcha['anticap'].apiKey;
  let refreshRate = Config.captcha['anticap'].refreshRate;

  let url = 'https://api.anti-captcha.com/createTask';

  let form = {
    clientKey: apiKey,
    task: {
      type: 'NoCaptchaTaskProxyless',
      websiteURL: productUrl,
      websiteKey: sitekey
    }
  };

  if(proxy != null) {
    let p = getProxyDetails(proxy);
    form.task.type = 'NoCaptchaTask';
    form.task.proxyType = 'http';
    form.task.proxyAddress = p.ip;
    form.task.proxyPort = p.port;
    form.task.proxyLogin = p.user;
    form.task.proxyPassword = p.pass;
    form.task.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36';
  }

  let opts = {
    url: url,
    method: 'POST',
    body: form,
    json: true
  }

  return new Promise((resolve, reject) => {
    request(opts)
    .then((json) => {
      console.log(json);
      if(json.taskId == null) {
        // error occurred
        if(!(json.errorDescription.includes('Account authorization key not found in the system'))) {
          return reject('[AntiCap] Error: ' + json.errorDescription);
        }
      }

      let id = json.taskId;

      let resUrl = `https://api.anti-captcha.com/getTaskResult`;

      // we will check every 3 seconds
      let tId = setInterval(() => {
        request({
          url: resUrl,
          method: 'GET',
          body: {
            clientKey: apiKey,
            taskId: id
          },
          json: true
        })
        .then((json) => {
          if(json.errorId !== 0) {
            return reject('[AntiCap] Error: ' + json.errorDescription);
          }

          if(json.status != 'ready')
            return;

          let response = json.solution.gRecaptchaResponse;

          clearInterval(tId);

          return resolve(response);
        })
        .catch((err) => {
          return;
        })
      }, refreshRate * 1000);
    })
    .catch((err) => {
      reject("[AntiCap] Error making request to get captcha solved.");
    })
  })
}
