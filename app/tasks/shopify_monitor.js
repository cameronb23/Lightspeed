import request from 'request-promise';

function determineJsonAvailability(config: ShopifyConfig): Promise<boolean> {
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


