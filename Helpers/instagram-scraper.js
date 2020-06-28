const { Curl } = require('node-libcurl');

module.exports.getProfiles = async (request, links) => {
  console.log(links);
  return links.map(async (element) => {
    const curl = new Curl();

    curl.setOpt('URL', element);
    curl.setOpt(Curl.option.FOLLOWLOCATION, true);

    const scrape = () => {
      return new Promise((resolve) => {
        curl.on('end', (statusCode, data) => {
          const match = data.match(
            /<script type="text\/javascript">window\._sharedData\s?=(.+);<\/script>/
          );

          if (match !== null && match[1] !== undefined) {
            const sharedData = JSON.parse(match[1]);

            if (sharedData.entry_data.ProfilePage !== undefined) {
              const profile = sharedData.entry_data.ProfilePage[0].graphql.user;
              profile.likeAverage = null;

              let medias = profile.edge_owner_to_timeline_media.edges;

              medias = medias.filter(
                (media) =>
                  (new Date().getTime() - media.node.taken_at_timestamp * 1000) / 3600000 > 24
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

              const formattedProfile = {
                url: `https://www.instagram.com/${profile.username}/`,
                username: profile.username,
                name: profile.full_name,
                biography: profile.biography,
                followers: profile.edge_followed_by.count,
                following: profile.edge_follow.count,
                externalUrl: profile.external_url,
                id: profile.id,
                isPrivate: profile.is_private,
                isVerified: profile.is_verified,
                isBusiness: profile.is_business_account,
                profilePictureUrl: profile.profile_pic_url_hd,
                likeAverage: profile.likeAverage.toFixed(2),
                engagement: ((profile.likeAverage / profile.edge_followed_by.count) * 100).toFixed(
                  2
                ),
              };
              request.log.info(formattedProfile);
              resolve(formattedProfile);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
          curl.close();
        });
      });
    };

    curl.on('error', (error) => request.log.trace(error));
    curl.perform();

    return scrape();
  });
};
