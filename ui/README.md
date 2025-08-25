# ACME ACCOUNTING UI

## Context

We have `companies`, companies have `users`.

Every user has a `role`, which defines what this user does in the
company. There might be multiple users with the same role.

We create `tickets` in a company and assign them to users.

Every ticket has

1. Type - defines the work that should be done by the user
2. Single assignee - the user
3. Category - every type is under a particular category
4. Status - open or resolved

**Endpoints**

- `GET  api/v1/tickets` - returns all tickets in the system. Without
  pagination. This is only for creating logic
  testing.
- `POST api/v1/tickets` - creates a ticket. It accepts `type` and `companyId`
- `DELETE api/v1/tickets/:id` - ticket hard delete
- `GET api/v1/companies` - returns all companies in the system. Without pagination.
- `POST api/v1/companies` - creates a company. It accepts `name`
- `DELETE api/v1/companies:id` - company hard delete
- `GET api/v1/users` - returns all users. Without pagination. Allowed filter by `companyId`
- `POST api/v1/users` - creates a company. It accepts `name`, `role`, `companyId`
- `DELETE api/v1/users:id` - user hard delete

**Ticket Creation Rules**

If a ticket type is `managementReport`, then the ticket category
should be `accounting`. The assignee is a user with the role = `Accountant`.
If there are multiple accountants in the company,
take the most recently created one.

If a ticket type is `registrationAddressChange`, then the ticket category
should be `Corporate`. Assignee is a user with the role `Corporate secretary`.
If there are multiple secretaries, throw an error.

If we cannot find an assignee with the required role, throw an error.

## Task

1. Write E2E tests to check the logic of Ticket Creation Rules. It is preferable to use playwright as a testing tool.

## Project setup and run

### Backend

1. NPM

```sh
$ npm install
```

2. Run the DB container

```sh
docker-compose up -d
```

3. Run migrations

```sh
npm run migrate:create
npm run migrate
```

4. Start the server

```sh
npm start
```

### Frontend

1. NPM

```sh
$ npm install
```

2. Start the server

```sh
npm start
```
