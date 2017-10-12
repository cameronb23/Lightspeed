// @flow

import request from 'request-promise';
import cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';

type ShopifyConfig = {
  base_url: string,
  keywords: Array<string>,
  checkoutProfileId: string,
  userAgent: string
};

type SessionConfig = {
  checkout_url: string,
  current_url: string,
  storeId: string,
  cookieJar: CookieJar,
  checkoutId: string,
  currentStep: string
};

type ItemVariant = {
  handle: string,
  id: string
};

async function start() {
  const g = await addToCart({
    base_url: 'https://packershoes.com',
    keywords: ['gang', 'boost'],
    checkoutProfileId: 'a',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
  }, {
    handle: 'adidas-comsortium-x-united-arrows-x-slam-jam-campus',
    id: '52740969235'
  });

  console.log(JSON.stringify(g));
}

function determineJsonAvailability(config: ShopifyConfig) {
  return new Promise(async (resolve) => {
    // check for /products.json availability
    const opts = {
      url: `${config.base_url}/products.json`,
      method: 'GET',
      resolveWithFullResponse: true
    };

    try {
      const response = await request(opts);

      if (response.statusCode !== 200) {
        return resolve(false);
      }

      return resolve(true);
    } catch (err) {
      return resolve(false);
    }
  });
}

function addToCart(config: ShopifyConfig, item: ItemVariant) {
  const cookies = request.jar();
  return new Promise(async (resolve, reject) => {
    let opts = {
      url: `${config.base_url}/cart/${item.id}:1`,
      method: 'GET',
      // form: {
      //   id: item.id,
      //   qty: 1
      // },
      headers: {
        Origin: config.base_url,
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Referer: `${config.base_url}/products/${item.handle}`,
        'Accept-Language': 'en-US,en;q=0.8'
      },
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: cookies
    };

    try {
      const response = await request(opts);
      const checkout = response.request.uri.href;

      console.log(`Redirected to: ${checkout}`);

      const urlData = checkout.replace(`${config.base_url}/`, '');

      const urlSplit = urlData.split('/checkouts/');
      const store = urlSplit[0];
      const id = urlSplit[1];

      return resolve({
        checkout_url: checkout,
        current_url: checkout,
        storeId: store,
        cookieJar: cookies,
        checkoutId: id,
        currentStep: 'contact_information'
      });

      // TODO: request the cart
      // opts = {
      //   url: `${config.base_url}/cart`,
      //   method: 'GET',
      // };
    } catch (e) {
      console.log(e);
      return reject(e);
    }
  });
}

function retrieveShippingRates(session: SessionConfig) {
  return new Promise(async (resolve, reject) => {
    const url = `${session.checkout_url}?previous_step=contact_information&step=shipping_method`;

    const opts = {
      url,
      method: 'GET',
      transform(body) {
        return cheerio.load(body);
      }
    };

    try {
      const $ = await request(opts);
      const elements = $('[data-checkout-total-shipping-cents]');

      const items = elements.map((index, el) => {
        const obj = $(el);
        return {
          id: obj.val(),
          price: obj.data('checkout-total-shipping-cents')
        };
      });

      return resolve(items);
    } catch (e) {
      return reject(e);
    }
  });
}

class ShopifyTask {
  config: ShopifyConfig;
  session: ?SessionConfig = null;
  product: ?ItemVariant = null;
  json: ?boolean = null;

  constructor(config: ShopifyConfig) {
    this.config = config;
  }

  async scan() {
    // scan for a product using sitemap or products.json
    if (this.json == null) {
      this.json = await determineJsonAvailability(this.config);
    }
  }

  async atc() {
    if (this.product == null) {
      console.log('Unable to add to cart! Product not found!');
      return;
    }

    try {
      this.session = await addToCart(this.config, this.product);
    } catch (e) {
      console.log('Failed to add to cart: ', e);
      return this.atc();
    }
  }
}

start();

export default ShopifyTask;
