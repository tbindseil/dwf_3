import Knex from 'knex';
import { Model } from 'objection';

import { io, server } from './app';

const knex = Knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    database: 'tj',
    port: 5432,
    password: 'your_password', // TODO what are these? might need to recreate database..
    user: 'your_username',
  },
})

// Connect database to Objection
Model.knex(knex)

io.listen(6543);

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
