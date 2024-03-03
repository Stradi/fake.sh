# Fake.sh

Multi-tenant mock API. The whole project is built with PNPM Workspaces.

## Overview

Monorepo is separated by usage of packages, `apps` and `packages`. Apps are deployable projects (`frontend`, `backend-api` and `tenant-api`), packages are common files that are used by apps.

### Frontend

Built with Next.js and Shadcn UI library. Has the following features built:

1. Authentication (login, logout, register) and automatic JWT token refreshing.
2. Creating, deleting and updating projects.
3. Creating, deleting and updating mock api versions.

### Backend API

Used by frontend and implements the following modules:

1. Accounts: CRUD routes for Account data type. Can be used in admin panel to see how many users the app has, etc...
2. Auth: Login, register, logout and refresh token.
3. Groups: Each account has one or more groups attached to it. Groups allows accounts to have certain permissions, allow/disallow access for certain resources. For example an account with `Registered` group cannot access the `Account` resource because that's dumb. But accounts who has `Admin` group can.
4. Permissions: CRUD routes for permissions. Can be used in admin panel. Each permission can be checked with `BasePolicy.can` or `BasePolicy.canMultiple` methods. These methods accept permission name and account data (JWT payload) and returns a boolean that indicates if the groups of the account has the permission required.
5. Projects: CRUD routes for project. A project is a container for mock API versions (schemas).
6. Schemas: CRUD routes for versioned mock API schema. Each schema holds the generation data (in JSON format) and initial count. Each created schema can be available in `tenant-api`.

### Tenant API

Used by actual users that are using the platform.

This app is responsible for handling the requests for schemas. For example, a user can have a project with name `Vercel` and two schemas (`v1` and `v2`) with `users` resource. This api will handle the following requests:

- `vercel.fake.sh/api/v1/users`: Will return the generated mock data for the first schema.
- `vercel.fake.sh/api/v2/users`: Will return the generated mock data for the second schema.

This also handles all the common request methods (GET, POST, PUT/PATCH and DELETE).

The main working principle is that each created schema is a table in PostgreSQL database. When user creates a schema, it'll populate the table with the data from `Faker.js` if applicable.
Once a request comes to this tenant API, the controller first do some checks (such as if tenant is valid, if request is valid, etc.) and if everything is correct, runs simple SQL queries and return the result in a predictable format.

## Deploying

There is a `Makefile` at the root directory. Running `make up` will start PosgresSQL database, Backend API and Tenant API. Running `make down` will delete all the containers deployed.

You need to deploy frontend application on Vercel, Cloudflare Pages (this probably won't work because RSC but dunno), Netlify or something like that.

Each application have an `env.example` file which lists the required environment variables for the application. Except frontend application. I forgot to update :(

## License

![matrix, spoon scene](./license.gif)
