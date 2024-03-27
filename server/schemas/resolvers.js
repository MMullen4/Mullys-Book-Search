const { User } = require('../models'); // Import the User model
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = { // Define the resolvers for the GraphQL schema using the Mongoose models and the jsonwebtoken library
    Query: {
        // Make it so a logged in user can only query their own profile
        me: async (parent, args, context) => {
            if (context.user) { // context is like a cookie session, it's an object that's passed through every resolver
                return User.findOne({ _id: context.user._id }); // Find the user by the id that's stored in the context
            }
            throw AuthenticationError; // If user attempts to execute this query and isn't logged in, throw an error
        },
    },

    Mutation: { // Define the mutations for the GraphQL schema (addUser, login, saveBook & removeBook)
        addUser: async (parent, { username, email, password }) => { // Define the addUser mutation that creates a new user
            const user = await User.create({ username, email, password });
            const token = signToken(user); // Sign a new token for the user that was just created
            return { token, user }; // Return the token and user that was just created
        },
        login: async (parent, { email, password }) => {
            // Find a user by email
            const user = await User.findOne({ email });
            if (!user) { // if user is not found
                throw AuthenticationError; 
            }
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) { // if password is incorrect
                throw AuthenticationError;
            }
            const token = signToken(user); // Sign a new token for the user that was just created
            return { token, user }; // Return the token and user that was just created and logged in successfully.
        },

        // saveBook will add a book to the user's savedBooks array by `bookId` value passed in as a parameter to the mutation.
        saveBook: async (parent, { bookData }, context) => {
            // If the user is logged in, use the `findOneAndUpdate` method to add a new book to the user's `savedBooks` array
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id }, // Find the logged in user based on the ID we get from the context
                    {
                        $addToSet: { savedBooks: bookData }, // Add the new book to the `savedBooks` array in the user's document
                    },
                    { // Return the updated user document with the new book added to the `savedBooks` array
                        new: true,
                        runValidators: true,
                    }
                );
            }
            throw AuthenticationError; 
        },

        // will remove a book from the user's savedBooks array by `bookId` value passed in as a parameter to the mutation.
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id }, // Find the logged in user based on the ID we get from the context
                    { $pull: { savedBooks: { bookId } } }, // Remove book with specific `bookId` value
                    { new: true }
                );
            }
            throw AuthenticationError;
        },
    },
};
// Export the resolvers for the GraphQL schema to be used in the Apollo server
module.exports = resolvers;

