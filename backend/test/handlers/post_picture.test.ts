import PostPicture from '../../src/handlers/post_picture';


describe('PostPicture Tests', () => {
    let postPicture: PostPicture;
    beforeEach(() => {
        postPicture = new PostPicture();
    });

    it('gets the name from the input', async () => {
        const name = 'name';
        const body = { name: name };
        const returned = postPicture.getInput(body);
        expect(returned).toEqual({ name: name });
    });
});

