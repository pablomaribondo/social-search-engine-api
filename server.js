require('dotenv').config();
const fastify = require('fastify')({
  // logger: process.env.NODE_ENV === 'development',
  logger: true,
});

fastify.register(require('fastify-cors'));
fastify.register(require('./routes'));

const start = async () => {
  try {
    await fastify.listen(process.env.PORT || 3001, '0.0.0.0');

    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
