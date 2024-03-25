const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        // By adding context to our query, we can retrieve the logged in user without specifically searching for them
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw AuthenticationError; // If user attempts to execute this query and isn't logged in, throw an error
        },
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);
            return { token, user };
        },

        // Add a third argument to the resolver to access data in our `context`
        saveBook: async (parent, { bookData }, context) => {
            // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id }, // Find the logged in user based on the ID we get from the context
                    {
                        $addToSet: { savedBooks: bookData }, // Add the new book to the `savedBooks` array in the user's document
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );
            }
            // If user attempts to execute this mutation and isn't logged in, throw an error
            throw AuthenticationError;
        },

        // Make it so a logged in user can only remove a book from their own profile
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } }, // Remove book with specific `bookId` value
                    { new: true }
                );
            }
            throw AuthenticationError;
        },
    },
};

module.exports = resolvers;

