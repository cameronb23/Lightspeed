/* eslint flowtype/no-weak-types: 0 */
// @flow

import request from 'request-promise';

type ShopifyConfig = {
  base_url: string,
  keywords: Array<string>,
  checkoutProfileId: string
};

function determineJson(config: ShopifyConfig) {
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

class ShopifyTask {
  config: ShopifyConfig;
  product: ?Object = null;
  json: ?boolean = null;

  constructor(config: ShopifyConfig) {
    this.config = config;
  }

  async scan() {
    // scan for a product using sitemap or products.json
    if (this.json == null) {
      this.json = await determineJson(this.config);
    }
  }
}

export default ShopifyTask;
