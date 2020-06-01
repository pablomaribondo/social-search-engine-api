const seScraper = require('se-scraper');

module.exports.getLinks = async (keywords) => {
  const query = `site:instagram.com -inurl:/p/ -inurl:/tags/ -inurl:/explore/ -inurl:/channel/ ${keywords}`;

  const scrapeOptions = {
    search_engine: 'google',
    keywords: [query],
    num_pages: 2,
  };

  const scrapeResult = await seScraper.scrape({}, scrapeOptions);
  const pageList = scrapeResult.results[query];
  const pageIndex = Object.keys(pageList);

  const results = pageIndex.reduce(
    (accumulator, currentValue) => [...accumulator, ...pageList[currentValue].results],
    []
  );

  const links = results.map((element) => {
    let { link } = element;

    if (link.includes('/_u/')) {
      link = link.replace('/_u/', '/');
    }

    const linkArray = link.split('/');

    if (linkArray.length === 5) {
      linkArray.pop();
      return linkArray.join('/');
    }
    return link;
  });

  const uniqueLinks = links.filter((element, index) => links.indexOf(element) === index);

  return uniqueLinks;
};
