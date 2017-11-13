// @flow
import puppeteer from 'puppeteer';
import moment from 'moment';

const proxy = 'http://trrrrr:mMgDnVge@ys.rapid-connect.co:33128';


(async () => {
  const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
  const page = await browser.newPage();

  page.on('requestfailed', (req) => {
    console.log(req);
  });

  await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

  await page.goto('http://www.adidas.com/us/', { timeout: 10000 });

  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    };
  });

  console.log('Dimensions:', dimensions);
  await page.screenshot({path: 'coppedsupreme.png'});
  await browser.close();

})();
