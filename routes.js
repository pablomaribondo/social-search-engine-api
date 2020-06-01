const instagramProfiles = require('./Controllers/InstagramProfileController');

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
      },
    },
    handler: async (request, reply) => {
      if (request.query.social === 'instagram' && request.query.search) {
        return instagramProfiles.getAll(request, reply);
      }

      return reply
        .code(422)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ code: 422, data: 'Rede social inválida!' });
    },
  });
}

module.exports = routes;
