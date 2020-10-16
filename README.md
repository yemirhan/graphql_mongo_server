# GraphQL MongoDB Server

## Description

This is a starter project for a GraphQL server using Apollo Server. 
For Authentication and authorization processes it uses Redis as a database.

## Technology Stack
- Typescript
- Apollo-express-server
- Mongoose (Typegoose)
- TypeGraphQL
- Passport.JS (Soon)

## How to Use

- Download this repository
- Run "npm run build" and "npm run start"
- Enter the .env keys according to you (Redis is a must for auth, Mongo is a must for DB connection)
- Done! You can visit GraphQL Playground at http://localhost:4000/graphql

## Or use Docker

- Run command "docker build -t <YOUR_TAG_NAME> ."
- After that run "docker run -p 4000:4000 <YOUR_TAG_NAME> 

## Contributing
https://github.com/yemirhan/graphql_mongo_server/issues

## Contact
syusufemirhan@gmail.com
