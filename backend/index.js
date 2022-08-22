const http = require('http');

    // I guess I can start with a server that can:
    // 1. receive updates and apply them to a master thing
    // 2. propagate updates
    // 3. register and unregister clients from photos
    // 4. send png of picture upon registration
    // 5. list pictures
    // 6. create pictures

    //
    // hmm, there is a crud app here and a registration service
    // i say this because the methods and routes are hard to name
    // no need to overthink it
    //

const server = http.createServer(function (req, res) {
    res.statusCode = 200; // 200 = OK
    res.setHeader('Content-Type', 'application/json');

    console.log(`${req.method} request received at ${req.url}`);
    // TODO how to deal with <picture_id> in routes?
    // TODO how to deal with req.method === 'POST'
    if (req.url === '/<picture_id>/update' && req.method === 'POST') {
        // TODO update a reference picture and send to all registered clients
        res.write(JSON.stringify({'msg': 'received update'}));
        res.end();
    } else if (req.url === '/<picture_id>/clients' && req.method === 'PUT') {
        // TODO register a client, send them reference photo and subscribe them to updates
        res.write(JSON.stringify({'msg': 'client added to picture <picture_id>'}));
        res.end();
    } else if (req.url === '/<picture_id>/clients' && req.method === 'DELETE') {
        // TODO unregister a client
        res.write(JSON.stringify({'msg': 'client removed from picture <picture_id>'}));
        res.end();
    } else if (req.url === '/pictures' && req.method === 'GET') {
        // TODO return list of all photos by name and maybe include a thumbnail
        res.write(JSON.stringify({'msg': 'all pictures'}));
        res.end();
    } else if (req.url === '/pictures' && req.method === 'POST') {
        // TODO create picture with name and other details
        res.write(JSON.stringify({'msg': 'picture created'}));
        res.end();
    } else {
        res.statusCode = 400; // 400 = Bad request
        res.write(JSON.stringify({'msg': 'error'}));
        res.end();
    }
});

server.listen(8080, function () {
    console.log('Listening on port http://localhost:8080');
});
