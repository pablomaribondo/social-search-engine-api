const instagramProfiles = require('./Controllers/InstagramProfileController');
const tiktokProfiles = require('./Controllers/TiktokProfileController');
const twitterProfiles = require('./Controllers/TwitterProfileController');
const youtubeProfiles = require('./Controllers/YoutubeProfileController');

async function routes(fastify) {
  fastify.get('/', (request, reply) => {
    reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ healthcheck: 'Social Search Engine :)' });
  });

  fastify.route({
    method: 'GET',
    url: '/api/v1/profiles',
    schema: {
      querystring: {
        search: { type: 'string' },
        social: { type: 'string' },
        is_premium: { type: 'boolean' },
      },
    },
    handler: async (request, reply) => {
      const { search, social } = request.query;

      if (search) {
        switch (social) {
          case 'instagram':
            return instagramProfiles.getAll(request, reply);
          case 'tiktok':
            return tiktokProfiles.getAll(request, reply);
          case 'twitter':
            return twitterProfiles.getAll(request, reply);
          case 'youtube':
            return youtubeProfiles.getAll(request, reply);
          default:
            return reply
              .code(422)
              .header('Content-Type', 'application/json; charset=utf-8')
              .send({ code: 422, data: 'Rede social inválida!' });
        }
      }

      return reply
        .code(422)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ code: 422, data: 'Busca inválida!' });
    },
  });
}

module.exports = routes;
