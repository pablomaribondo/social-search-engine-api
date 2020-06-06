const seScraper = require('se-scraper');
const instagramLinkSanitizer = require('./instagram-link-sanitizer');

module.exports.getLinks = async (query) => {
  const { search, social } = query;

  const socialRef = {
    instagram(keywords) {
      return `site:instagram.com -inurl:/p/ -inurl:/tags/ -inurl:/explore/ -inurl:/channel/ ${keywords}`;
    },
    twitter(keywords) {
      return `site:twitter.com -inurl:/hashtag/ -inurl:/status/ -inurl:/moments/ -inurl:/statuses/ -inurl:/events/ ${keywords}`;
    },
  };

  const queryRef = socialRef[social];
  const keywords = queryRef(search);

  const scrapeOptions = {
    search_engine: 'google',
    keywords: [keywords],
    num_pages: 2,
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

    if (social === 'instagram') {
      link = instagramLinkSanitizer.sanitize(link);
    }

    return link;
  });

  const uniqueLinks = links.filter((element, index) => links.indexOf(element) === index);

  return uniqueLinks;
};
