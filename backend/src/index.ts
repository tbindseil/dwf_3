import * as http from 'http'
import { logic } from './logic' // TODO whats the best way to deal with importing my own code?

// TJTAG write tests
// hmmm, sees like the functionality and its unit tests live
// in the same node package

// so, already I find that this code isn't easy to test
// looks like i need something to encapsulate the below logic
//
// done
//
// after testing the logic function, I should be able to write
// integration tests that hit this server and make sure it works
const server = http.createServer(function (req: any, res: any) {
    console.log(`${req.method} request received at ${req.url}`);

    res.statusCode = 200; // 200 = OK
    res.setHeader('Content-Type', 'application/json');

    const url_tokens: string[] = req.url.split('/')

    logic(url_tokens, req, res);
});

server.listen(8080, function () {
    console.log('Listening on port http://localhost:8080');
});
