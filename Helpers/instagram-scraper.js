const got = require('got');

module.exports.getProfiles = async (request, links) => {
  return links.map(async (element) => {
    try {
      let profile;
      let medias;

      const response = await got(element);
      const sharedData = response.body.split('window._sharedData = ')[1];

      if (sharedData) {
        const scriptData = JSON.parse(sharedData.split(';</script>')[0]);

        profile = scriptData.entry_data.ProfilePage[0].graphql.user;
        profile.likeAverage = null;

        medias = profile.edge_owner_to_timeline_media.edges;

        medias = medias.filter(
          (media) => (new Date().getTime() - media.node.taken_at_timestamp * 1000) / 3600000 > 24
        );

        medias = medias.map((media) => media.node.edge_liked_by.count);

        if (medias && medias.length) {
          profile.likeAverage =
            medias.reduce((a, b) => {
              return a + b;
            }) / medias.length;
        } else {
          profile.likeAverage = 0;
        }

        return {
          url: `https://www.instagram.com/${profile.username}/`,
          username: profile.username,
          name: profile.full_name,
          biography: profile.biography,
          followedBy: profile.edge_followed_by.count,
          follow: profile.edge_follow.count,
          externalUrl: profile.external_url,
          // id: profile.id,
          isPrivate: profile.is_private,
          isVerified: profile.is_verified,
          isBusiness: profile.is_business_account,
          profilePictureUrl: profile.profile_pic_url_hd,
          likeAverage: profile.likeAverage.toFixed(2),
          // engagement: ((profile.likeAverage / profile.edge_followed_by.count) * 100).toFixed(2),
        };
      }

      return null;
    } catch (error) {
      request.log.info('Erro');
      return null;
      // throw new Error('Error: ', error);
    }
  });
};
