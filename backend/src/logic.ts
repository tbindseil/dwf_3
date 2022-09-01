import {
    API
} from './handlers/api';

export class Logic {
    get_pictures: API;
    post_pictures: API;
    put_clients: API;
    delete_clients: API;
    post_update: API;
    error_handler: API;

    constructor(get_pictures: API,
                post_pictures: API,
                put_clients: API,
                delete_clients: API,
                post_update: API,
                error_handler: API) {
        this.get_pictures = get_pictures;
        this.post_pictures = post_pictures;
        this.put_clients = put_clients;
        this.delete_clients = delete_clients;
        this.post_update = post_update;
        this.error_handler = error_handler;
    }

    public logic(url_tokens: string[], req: any, res: any): void {
        // TODO how to deal with req.method === 'POST'
        if (url_tokens.length === 1 && url_tokens[0] === 'pictures') {
            if (req.method === 'GET') {
                this.get_pictures.call(req, res);
            } else if (req.method === 'POST') {
                this.post_pictures.call(req, res);
            }
        } else if (url_tokens.length === 2) {
            const picture_id = url_tokens[0];
            if (url_tokens[1] === 'clients') {
                if (req.method === 'PUT') {
                    this.put_clients.call(req, res);
                } else if (req.method === 'DELETE') {
                    this.delete_clients.call(req, res);
                }
            } else if (url_tokens[1] === 'update') {
                if (req.method === 'POST') {
                    this.post_update.call(req, res);
                }
            }
        } else {
            res.statusCode = 400; // 400 = Bad request
            res.write(JSON.stringify({'msg': 'error'}));
            res.end();
            // this.error_handler(); // TODO delete error handler
        }
    }
}
