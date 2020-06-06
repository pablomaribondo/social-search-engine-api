const got = require('got');
const querystring = require('querystring');

module.exports.getProfiles = async (request, links) => {
  try {
    const firstLink = links[0];

    const firstLinkResponse = await got(firstLink);

    const baseFileUrl = 'https://abs.twimg.com/responsive-web/web/main.';
    const scriptSection = firstLinkResponse.body.split(baseFileUrl);
    const fileId = scriptSection[scriptSection.length - 1].split('.js')[0];

    const tokenResponse = await got(`${baseFileUrl}${fileId}.js`);

    const queryIdSection = tokenResponse.body.split('fDBV:function(e,t){e.exports={queryId:"');
    const queryId = queryIdSection[1].split('",operationName:')[0];

    const tokenSection = tokenResponse.body.split('s="Web-12",c="');
    const token = tokenSection[1].split('",u="')[0];

    const url = `https://api.twitter.com/graphql/${queryId}/UserByScreenName`;

    return links.map(async (element) => {
      const screenName = element.split('/')[3];

      const response = await got(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        searchParams: querystring.stringify({
          variables: `{"screen_name":"${screenName}","withHighlightedLabel":true}`,
        }),
        responseType: 'json',
      });

      const profile = response.body.data.user.legacy;

      const externalUrl =
        profile.entities.url !== undefined ? profile.entities.url.urls[0].expanded_url : null;

      let profileImageUrl = profile.profile_image_url_https;

      if (profileImageUrl && profileImageUrl.length) {
        const imageUrlArray = profileImageUrl.split('/');
        const index = imageUrlArray.length - 1;

        imageUrlArray[index] = imageUrlArray[index].replace('_normal', '');
        profileImageUrl = imageUrlArray.join('/');
      }

      return {
        url: element,
        username: profile.screen_name,
        name: profile.name,
        description: profile.description,
        externalUrl,
        location: profile.location,
        protected: profile.protected,
        verified: profile.verified,
        followers: profile.followers_count,
        following: profile.friends_count,
        likes: profile.favourites_count,
        lists: profile.listed_count,
        tweets: profile.statuses_count,
        profilePictureUrl: profileImageUrl,
      };
    });
  } catch (error) {
    request.log.info(error);
    return null;
  }
};
