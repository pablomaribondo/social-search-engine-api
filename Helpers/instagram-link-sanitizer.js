module.exports.sanitize = (element) => {
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
};
