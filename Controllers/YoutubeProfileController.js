const { google } = require('googleapis');

/**
 * Função para retornar os perfis do Youtube
 * @param {Object} request - Pedido do cliente
 * @param {Reply} reply - Resposta para o cliente
 * @returns {Object} Perfis do Youtube
 */
async function getAll(request, reply) {
  try {
    const { search, is_premium: isPremium } = request.query;

    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_AUTH,
    });

    const maxResults = isPremium ? 45 : 18;

    const searchResponse = await youtube.search.list({
      part: 'snippet',
      order: 'viewCount',
      q: search,
      type: 'channel',
      maxResults,
    });

    const profileList = searchResponse.data.items;
    const ids = profileList.map((element) => element.snippet.channelId);
    const channelResponse = await youtube.channels.list({
      part: 'statistics',
      id: ids,
    });

    const statisticsList = channelResponse.data.items;
    const formattedStatistics = statisticsList.reduce((accumulator, currentValue) => {
      accumulator[currentValue.id] = currentValue.statistics;
      return accumulator;
    }, {});

    const result = profileList.map((element) => {
      const id = element.snippet.channelId;
      const statistics = formattedStatistics[id];

      return {
        id,
        name: element.snippet.channelTitle,
        description: element.snippet.description,
        profilePictureUrl: element.snippet.thumbnails.default.url,
        viewCount: statistics.viewCount,
        subscriberCount: statistics.subscriberCount,
        videoCount: statistics.viewCount,
        url: `https://www.youtube.com/channel/${id}`,
      };
    });

    return reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ code: 200, data: result });
  } catch (error) {
    return reply
      .code(400)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ code: 400, data: `Error: ${error}` });
  }
  // const links = await googleScraper.getLinks(request.query);
  // const profiles = await instagramScraper.getProfiles(request, links);

  // Promise.all(profiles)
  //   .then((data) => {
  //     const requiredData = data.filter((element) => element !== null && element !== undefined);

  //     requiredData.sort((a, b) => {
  //       if (a.followers > b.followers) {
  //         return -1;
  //       }
  //       if (a.followers < b.followers) {
  //         return 1;
  //       }
  //       return 0;
  //     });

  //     return reply
  //       .code(200)
  //       .header('Content-Type', 'application/json; charset=utf-8')
  //       .send({ code: 200, data: requiredData });
  //   })
  //   .catch((error) => {
  //     return reply
  //       .code(400)
  //       .header('Content-Type', 'application/json; charset=utf-8')
  //       .send({ code: 400, data: `Error: ${error}` });
  //   });
}

module.exports = {
  getAll,
};
