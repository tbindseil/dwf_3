import { PostPicture } from '../../../src/handlers/post_picture'
import APIError from '../../../src/handlers/api_error'
import IDB from '../../../src/db'
import LocalPictureAccessor from '../../../src/picture_accessor/local_picture_accessor'

// jest.mock('../../src/db');
// const mockQuery = jest.mocked(db.query, true);
// jest.mock('../../src/db');
// const mockQuery = jest.mocked(DB.query, true);
// const mockDB = jest.genMockFromModule<DB>('db');
// const mockDB = jest.mock<DB>('db');
// mockDB.
const mockQuery = jest.fn()
const mockDB = {
    query: mockQuery,
} as IDB

// TODO what is better, this or ts-mockito
jest.mock('../../../src/picture_accessor/local_picture_accessor')
const mockLocalPictureAccessor = jest.mocked(LocalPictureAccessor, true)

describe('PostPicture Tests', () => {
    const name = 'name'
    const createdBy = 'createdBy'
    const body = { name: name, createdBy: createdBy }

    const mockJimpAdapter = {
        createJimp: jest.fn(),
        read: jest.fn(),
    }
    const prototypeFileName = 'prototypeFileName'
    const baseDirectory = 'baseDirectory'
    let mockLocalPictureAccessorInstance: LocalPictureAccessor

    let postPicture: PostPicture

    beforeEach(() => {
        mockQuery.mockClear()
        mockLocalPictureAccessor.mockClear()
        mockJimpAdapter.createJimp.mockClear()
        mockJimpAdapter.read.mockClear()
        mockLocalPictureAccessorInstance = new LocalPictureAccessor(
            mockJimpAdapter,
            prototypeFileName,
            baseDirectory
        )
        postPicture = new PostPicture(mockDB, mockLocalPictureAccessorInstance)
    })

    it('gets the name and createdBy from the input', () => {
        const returned = postPicture.getInput(body)
        expect(returned).toEqual(body)
    })

    it("throws when input doesn't have a name field", async () => {
        expect(() => postPicture.getInput({})).toThrow(
            new APIError(
                400,
                'name and created by must be provided, picture not created'
            )
        )
    })

    it("throws when input doesn't have a createdBy field", async () => {
        expect(() => postPicture.getInput({})).toThrow(
            new APIError(
                400,
                'name and created by must be provided, picture not created'
            )
        )
    })

    it('creates a new image with the expected createdBy', async () => {
        const mockCreateNewPicture =
            mockLocalPictureAccessorInstance.createNewPicture as jest.Mock

        await postPicture.process(mockDB, body)

        expect(mockCreateNewPicture).toHaveBeenCalledTimes(1)
        expect(mockCreateNewPicture).toHaveBeenCalledWith(name, createdBy)
    })

    it('calls db query when procesing', async () => {
        const filename = 'filename'
        const filesystem = 'filesystem'
        const mockCreateNewPicture =
            mockLocalPictureAccessorInstance.createNewPicture as jest.Mock
        mockCreateNewPicture.mockImplementation(
            (pictureName: string, createdBy: string) => {
                pictureName
                createdBy
                return filename
            }
        )
        const mockGetFileSystem =
            mockLocalPictureAccessorInstance.getFileSystem as jest.Mock
        mockGetFileSystem.mockImplementation(() => {
            return filesystem
        })

        await postPicture.process(mockDB, body)

        const expectedQuery =
            'insert into picture (name, createdBy, filename, filesystem) values (?, ?, ?, ?);'
        const expectedParams = [name, createdBy, filename, filesystem]
        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery).toHaveBeenCalledWith(expectedQuery, expectedParams)
    })

    it('throws an api error when the creation of the new picture fails', async () => {
        const mockCreateNewPicture =
            mockLocalPictureAccessorInstance.createNewPicture as jest.Mock
        mockCreateNewPicture.mockImplementation(
            (pictureName: string, createdBy: string) => {
                pictureName
                createdBy
                throw new Error()
            }
        )
        await expect(postPicture.process(mockDB, body)).rejects.toThrow(
            new APIError(500, 'database issue, picture not created')
        )
    })

    it('throws an api error when the database query fails', async () => {
        mockQuery.mockImplementation((query: string, params: string[]) => {
            query
            params
            throw new Error()
        })
        await expect(postPicture.process(mockDB, body)).rejects.toThrow(
            new APIError(500, 'database issue, picture not created')
        )
    })
})
