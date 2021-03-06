const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            console.log('CONTEZXT~~~~~~~ in query me', context)
            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        users: async () => {
            return await User.find().select('-__v -password').populate('savedBooks');
        },
        user: async (parent, { username }) => {
            return await User.findOne({ username }).select('-__v -password').populate('savedBooks');
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            console.log('WE Hit thE BacKEND1!1')
            const user = await User.create(args);
            console.log(user)
            const token = signToken(user);
            console.log(token)
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No profile with this email found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, user };
        },

        //Add a third argument to the resolver to access data in our `context`
        // saveBook: async (parent, { bookData }, context) => {
        saveBook: async (parent, args, context) => {
            console.log('INSIDE save book RESOLVEr11 args1', args)
            console.log('PareNT!!1', parent)
            console.log('CONTEXT', context)
            // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
            if (context.user) {
                console.log(context.user)
                const userSaveBook = await User.findByIdAndUpdate(
                    { _id: context.user_id },
                    {
                        $push: { savedBooks: bookData },
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                ); return userSaveBook,
                    console.log(userSaveBook)
            }
            console.log('WE ABOUT TO HIT THE THROW ERROR')
            // If user attempts to execute this mutation and isn't logged in, throw an error
            throw new AuthenticationError('There was a request error');
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const removeBook = await User.findOneAndDelete(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                ); return removeBook
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

module.exports = resolvers;
