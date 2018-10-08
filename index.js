const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
  input BookInput {
    title: String
    author: String
  }

  type Book {
    id: ID!
    title: String
    author: String
  }

  type Query {
    books: [Book]
    book(id: ID!): Book
  }

  type Mutation {
    createBook(input: BookInput!): Book
    updateBook(id: ID!, input: BookInput): Book
  }
`

class Book {
  constructor(id, { title, author }) {
    this.id = id
    this.title = title
    this.author = author
  }
}

const fakeDatabase = {}

const resolvers = {
  Query: {
    books: () => Object.keys(fakeDatabase).map(key => new Book(
        key,
        { title: fakeDatabase[key].title, author: fakeDatabase[key].author }
      )
    ),
    book: (_, { id }) => {
      if (!fakeDatabase[id]) {
        throw new Error('no book exists with id ' + id)
      }
      return new Book(id, fakeDatabase[id])
    }
  },
  Mutation: {
    createBook: (_, {input}) => {
      const id = require('crypto').randomBytes(10).toString('hex')

      fakeDatabase[id] = input
      return new Book(id, input)
    },
    updateBook: (_, { id, input }) => {
      if (!fakeDatabase[id]) {
        throw new Error('no book exists with id ' + id)
      }

      fakeDatabase[id] = input
      return new Book(id, input)
    },
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
