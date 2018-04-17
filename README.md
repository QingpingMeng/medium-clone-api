# Serverless Typescript + Mongodb implementation for RealWorld example

> ### Example Django DRF codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) API spec.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* Node.js v6.5.0 or later.
* Serverless CLI v1.9.0 or later. You can run npm install -g serverless to install it.
* An AWS account. If you don't already have one, you can sign up for a [free trial](https://aws.amazon.com/s/dm/optimization/server-side-test/free-tier/free_np/) that includes 1 million free Lambda requests per month.
* Set-up your [Provider Credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials). [Watch the video on setting up credentials](https://www.youtube.com/watch?v=HSd9uYj2LJA).

### Installing
check out the repository

```
https://github.com/QingpingMeng/medium-clone-api.git
```

install dependencies

```
yarn install
```

start a local mongodb instance

```
yarn add mongodb -g
mongod --dbpath=<db-path>
```

run serverless offline:

```
yarn start
```

## Running the tests

A few tests will fail for some reasons. PRs are welcome.

```
yarn test
```

## Deployment

Create a env file called env.yml with the following content for deployment.

```
prod:
  db: <your-db-connection-string>
```

And run deployment command.

```
yarn deploy
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

