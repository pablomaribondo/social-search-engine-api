const seScraper = require('se-scraper');
const linkSanitizer = require('./link-sanitizer');

module.exports.getLinks = async (query) => {
  const { search, social, is_premium: isPremium } = query;

  const socialRef = {
    instagram(keywordsQuery) {
      return `site:instagram.com -inurl:/p/ -inurl:/tags/ -inurl:/explore/ -inurl:/channel/ -inurl:/stories/ -inurl:/tv/ -inurl:/feed/ ${keywordsQuery}`;
    },
    tiktok(keywordsQuery) {
      return `site:www.tiktok.com -inurl:/tag/ -inurl:/share/ -inurl:/music/ -inurl:/video/ ${keywordsQuery}`;
    },
    twitter(keywordsQuery) {
      return `site:twitter.com -inurl:/hashtag/ -inurl:/status/ -inurl:/moments/ -inurl:/statuses/ -inurl:/events/ -inurl:/media/ ${keywordsQuery}`;
    },
  };

  const queryRef = socialRef[social];
  const keywords = queryRef(search);
  const maxResults = isPremium ? 5 : 2;

  const scrapeOptions = {
    search_engine: 'google',
    keywords: [keywords],
    num_pages: maxResults,
  };

  const scrapeResult = await seScraper.scrape({}, scrapeOptions);
  const pageList = scrapeResult.results[keywords];
  const pageIndex = Object.keys(pageList);

  const results = pageIndex.reduce(
    (accumulator, currentValue) => [...accumulator, ...pageList[currentValue].results],
    []
  );

  const links = results.map((element) => {
    let { link } = element;

    link = linkSanitizer.sanitize(link, social);

    return link.toLowerCase();
  });

  const uniqueLinks = links.filter((element, index) => links.indexOf(element) === index);

  return uniqueLinks;
};
