// creates an ApolloProvider component that wraps the entire application, 
// allowing all of its children to make requests to the GraphQL API server.
import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context'; 

const httpLink = createHttpLink({
  uri: '/graphql'
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
const client = new ApolloClient({
  // set up our client to execute the authLink middleware prior to making the request to our API
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() { // wrap the entire application in an ApolloProvider component
  return (
    <ApolloProvider client={client}>
        <Navbar />
        <Outlet />
    </ApolloProvider>
  );
}

export default App;
