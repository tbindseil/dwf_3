class PicturesClient {
    private static instance: PicturesClient;
    public static getClient() {
        if (!this.instance) {
            PicturesClient.instance = new PicturesClient();
        }
        return PicturesClient.instance;
    }

    // api calls
    // make a list of paragraphs with return msg and requested url
    /*  from backend/index.js
    if (url_tokens.length === 1 && url_tokens[0] === 'pictures') {
        if (req.method === 'GET') {
            // TODO return list of all photos by name and maybe include a thumbnail
            res.write(JSON.stringify({'msg': 'all pictures'}));
            res.end();
        } else if (req.method === 'POST') {
            // TODO create picture with name and other details
            res.write(JSON.stringify({'msg': 'picture created'}));
            res.end();
        }
    } else if (url_tokens.length === 2) {
        picture_id = url_tokens[0];
        if (url_tokens[1] === 'clients') {
            if (req.method === 'PUT') {
                // TODO register a client, send them reference photo and subscribe them to updates
                res.write(JSON.stringify({'msg': 'client added to picture <picture_id>'}));
                res.end();
            } else if (req.method === 'DELETE') {
                // TODO unregister a client
                res.write(JSON.stringify({'msg': 'client removed from picture <picture_id>'}));
                res.end();
            }
        } else if (url_tokens[1] === 'update') {
            if (req.method === 'POST') {
                // TODO update a reference picture and send to all registered clients
                res.write(JSON.stringify({'msg': 'received update'}));
                res.end();
            }
        }
    } else {
        res.statusCode = 400; // 400 = Bad request
        res.write(JSON.stringify({'msg': 'error'}));
        res.end();
    }*/
}

export default PicturesClient;
