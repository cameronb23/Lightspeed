import request from 'request-promise';
import _ from 'underscore';
import { parseString } from 'xml2js';
import promisify from 'promisify-es6';

const parseXML = promisify(parseString);


class ShopifyException extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ShopifyException);
  }
}

const JsonAvailability: Array<Object> = [];
// ^ this "Array<Object>" denotes what the "JsonAvailability" variable will be
// so basically if I try to add/remove from the array a value that doesn't match Object,
// it will tell me, so i can reduce errors in my code at runtime


async function determineJsonAvailability(config: ShopifyConfig): Promise<boolean> {
  const cached = _.findWhere(JsonAvailability, { siteUrl: config.base_url });
  if (cached != null) {
    return cached.val;
  }

  // check for /products.json availability
  const opts = {
    url: `${config.base_url}/products.json`,
    method: 'GET',
    resolveWithFullResponse: true
  };

  try {
    const response = await request(opts);

    if (response.statusCode !== 200) {
      // throw new ShopifyException(`Response code: ${response.statusCode}`);
      JsonAvailability.push({ siteUrl: config.base_url, val: false });
      return false;
    }

    JsonAvailability.push({ siteUrl: config.base_url, val: true });
    return true;
  } catch (err) {
    throw new ShopifyException(`Request error: ${err.message}`);
  }
}

// TODO: configuration for Atom-based product lookup

// TODO: enums for product lookup mode?
export default async function scanOnce(config: ShopifyConfig, mode: string) {
  switch (mode) {
    case 'ATOM':
      return scanAtom(config);
    case 'JSON':
      return null;
    case 'XML':
      return null;
    default:
      return null;
  }
}

// 25 most recent items


function containsKeywords(test: string, keywords: Array<string>) {
  // for (let i = 0; i < keywords.length; i += 1) {
  //   const k = keywords[i];

  //   if (test.title[0].includes(k)) {
  //     return true;
  //   }

  const negativeKeywords = keywords.filter(k => k.startsWith('-'));

  const positiveKeywords = _.difference(keywords, negativeKeywords);

  // const keys = positiveKeywords.join('|').toLowerCase();
  // const reg = new RegExp(keys, 'gi');

  // if (test.toLowerCase().match(reg) !== null) {
  //   for (let i = 0; i < negativeKeywords.length; i += 1) {
  //     if (test.toLowerCase().includes(negativeKeywords[i].substring(1).toLowerCase())) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  for (let i = 0; i < positiveKeywords.length; i += 1) {
    if (!test.toLowerCase().includes(positiveKeywords[i].toLowerCase())) {
      return false;
    }
  }

  for (let i = 0; i < negativeKeywords.length; i += 1) {
    if (test.toLowerCase().includes(negativeKeywords[i].substring(1).toLowerCase())) {
      return false;
    }
  }

  return true;
}

export async function scanAtom(config: ShopifyConfig) {
  const url = `${config.base_url}/collections/all.atom`;
  const opts = {
    url,
    method: 'GET',
    gzip: true,
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    },
    resolveWithFullResponse: true
  };

  try {
    const response = await request(opts);

    const rawData = response.body;

    try {
      const json = await parseXML(rawData);

      if (json == null) {
        throw new ShopifyException('Undefined parsed result');
      }

      const entries = json.feed.entry;

      // scan all items
      const scanResults = entries.filter(entry => containsKeywords(entry.title[0], config.keywords));

      if (scanResults.length === 0) {
        return [];
      }

      const formatted = [];

      try {
        scanResults.forEach(r => {
          formatted.push({
            title: r.title[0],
            handle: r.link[0].$.href.split('products/')[1],
            id: r.id[0].split('products/')[1],
          });
        });
      } catch (e) {
        throw new ShopifyException(`Error parsing Atom item: ${e}`);
      }

      console.log(formatted);
      return formatted;
    } catch (e) {
      console.log(e);
      throw new ShopifyException('Error parsing XML');
    }
  } catch (e) {
    console.log(e);
    throw new ShopifyException(`Error retrieving Atom Feed: ${e}`);
  }
}
type ShopifyConfig = {
  base_url: string,
  keywords: Array<string>,
  checkout_profile: CheckoutProfile,
  userAgent: string,
  proxies: Array<string>,
  size: string
};
