export default `
    type User {
        _id: ID
        username: String
        email: String
        firstName: String
        lastName: String
        credit: Float
        image: Upload
    }   
    
    type Query {
        user(userId: String!): User!
    } 

    type Mutation {
        updateCredit(userId: String!, newCredit: Float!): MutationResponse!
    } 

    scalar Upload

    type Mutation {
        updateImage(userId: String!, image: Upload!): MutationResponse!
    } 

    type Mutation {
        updateCredit(userId: String!, newCredit: Float!): MutationResponse!
    } 
`
