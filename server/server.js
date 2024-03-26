const express = require('express');
const path = require('path');
const db = require('./config/connection');

const { ApolloServer } = require('@apollo/server'); // import ApolloServer
const { authMiddleware } = require('./utils/auth'); // import authMiddleware
const { expressMiddleware } = require('@apollo/server/express4'); // import expressMiddleware
const { typeDefs, resolvers } = require('./schemas'); // import typeDefs and resolvers from schemas.js

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the Apollo server with the expressMiddleware function to handle GraphQL requests and responses.
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => { // Start the API server
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
startApolloServer();

