see how integ tests do migrations:

-   might need to be from command line... point to build output for migrations with knex config
-   npx knex migrate:make --stub -x ts - makes a new knex migration thing, copy paste would be as good honestly

Ok, I did a migration and these commands are helpful
`npx knex migrate:latest --knexfile src/db/migrations_knex_file.ts`
`npx knex migrate:list --knexfile src/db/migrations_knex_file.ts`
`npx knex migrate:up build/src/db/migrations/20230506042708_initial-schema.js  --knexfile src/db/migrations_knex_file.ts`
`npx knex migrate:down build/src/db/migrations/20230539042708_created_by_snake_case.js  --knexfile src/db/migrations_knex_file.ts`

also, I had to mess with the table a bit (knex keeps track of the migrations in a table on the db)
Since the picture db already existed, I had to comment out that when running `... migrate:latest ...`
