const googleScraper = require('../Helpers/google-scraper');
const instagramScraper = require('../Helpers/instagram-scraper');

/**
 * Função para retornar os perfis do Instagram
 * @param {Object} request - Pedido do cliente
 * @param {Reply} reply - Resposta para o cliente
 * @returns {Object} Perfis do Instagram
 */
async function getAll(request, reply) {
  const { search } = request.query;
  const links = await googleScraper.getLinks(search);
  const profiles = await instagramScraper.getProfiles(request, links);

  Promise.all(profiles)
    .then((data) => {
      const requiredData = data.filter((element) => element !== null && element !== undefined);

      requiredData.sort((a, b) => {
        if (a.followedBy > b.followedBy) {
          return -1;
        }
        if (a.followedBy < b.followedBy) {
          return 1;
        }
        return 0;
      });

      return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ code: 200, data: requiredData });
    })
    .catch((error) => {
      return reply
        .code(400)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ code: 400, data: `Error: ${error}` });
    });
}

module.exports = {
  getAll,
};
