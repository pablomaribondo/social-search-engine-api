const TikTokScraper = require('tiktok-scraper');

module.exports.getProfiles = async (request, links) => {
  return links.map(async (element) => {
    try {
      const username = element.split('@')[1];
      const user = await TikTokScraper.getUserProfileInfo(username);

      return {
        url: element,
        username: user.uniqueId,
        name: user.nickName,
        signature: user.signature,
        following: user.following,
        followers: user.fans,
        id: user.userId,
        isSecret: user.isSecret,
        isVerified: user.verified,
        profilePictureUrl: user.covers[0],
        likes: user.heart,
        videos: user.video,
        digg: user.digg,
      };
    } catch (error) {
      request.log.info(error);
      return null;
    }
  });
};
