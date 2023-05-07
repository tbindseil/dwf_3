import {knex} from './db/knex_file';
import { Model } from 'objection';

import { io, server } from './app';

// Connect database to Objection
Model.knex(knex)

io.listen(6543);

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
