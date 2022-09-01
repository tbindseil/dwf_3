
export class Logic {
    get_pictures: () => void;
    post_pictures: () => void;
    put_clients: () => void;
    delete_clients: () => void;
    post_update: () => void;
    error_handler: () => void;

    // TJTAG these should probably be objects
    constructor(get_pictures: () => void,
                post_pictures: () => void,
                put_clients: () => void,
                delete_clients: () => void,
                post_update: () => void,
                error_handler: () => void) {
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
                this.get_pictures();
            } else if (req.method === 'POST') {
                this.post_pictures();
            }
        } else if (url_tokens.length === 2) {
            const picture_id = url_tokens[0];
            if (url_tokens[1] === 'clients') {
                if (req.method === 'PUT') {
                    this.put_clients();
                } else if (req.method === 'DELETE') {
                    this.delete_clients();
                }
            } else if (url_tokens[1] === 'update') {
                if (req.method === 'POST') {
                    this.post_update
                }
            }
        } else {
            this.error_handler();
        }
    }
}
