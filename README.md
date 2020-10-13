# GraphQL MongoDB Server

## How to Use

- Download this repository
- Run "npm run build" and "npm run start"
- Enter the .env keys according to you (Redis is a must for auth, Mongo is a must for DB connection)
- Done! You can visit GraphQL Playground at http://localhost:4000/graphql

## Or use Docker

- Run command "docker build -t <YOUR_TAG_NAME> ."
- After that run "docker run -p 4000:4000 <YOUR_TAG_NAME> 