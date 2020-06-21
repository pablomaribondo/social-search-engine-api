const splitter = (element, text) => {
  let link = element;

  if (link.includes(text)) {
    [link] = link.split(text);
  }

  return link;
};

const templates = {
  instagram(element) {
    let link = element;

    if (link.includes('/_u/')) {
      link = link.replace('/_u/', '/');
    }

    const linkArray = link.split('/');

    if (linkArray.length === 5) {
      linkArray.pop();
      return linkArray.join('/');
    }

    return link;
  },
  tiktok(element) {
    let link = splitter(element, '/video/');
    link = splitter(link, '?lang=');
    link = splitter(link, '?source=');
    link = splitter(link, '?traffic_type=');
    link = splitter(link, '?region=');
    link = splitter(link, '?refer=');
    link = splitter(link, '?langcountry=');

    return link;
  },
  twitter(element) {
    return splitter(element, '?lang=');
  },
};

module.exports.sanitize = (link, social) => {
  const sanitizedLink = templates[social];
  return sanitizedLink(link);
};
