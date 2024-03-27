// import gql, which is a function that will parse our string containing our GraphQL code 
// into a document that Apollo Client can work with
import { gql } from '@apollo/client'; 

export const QUERY_ME = gql`
  query me {
  me {
    _id
    username
    email
    bookCount
    savedBooks {
      bookId
      authors
      description
      title
      image
      link
    }
  }
}
`;
