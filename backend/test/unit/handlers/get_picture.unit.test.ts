import { GetPicture } from "../../../src/handlers/get_picture";
import APIError from "../../../src/handlers/api_error";
import IDB from "../../../src/db";
import LocalPictureAccessor from "../../../src/picture_accessor/local_picture_accessor";

// jest.mock('../../src/db');
// const mockQuery = jest.mocked(DB.query, true);
// const mockDB = jest.genMockFromModule<DB>('db');
// const mockDB = jest.mock<DB>('db');
// mockDB.
const mockQuery = jest.fn();
const mockDB = {
  query: mockQuery,
} as IDB;

jest.mock("../../../src/picture_accessor/local_picture_accessor");
const mockLocalPictureAccessor = jest.mocked(LocalPictureAccessor, true);

describe("GetPicture Tests", () => {
  const id = "id";
  const body = { id: id };

  // TODO this picture accessor mock stuff is duplicated
  // also, its probably only necessary to mock a PictureAccessor, not a LocalPictureAccessor
  const mockJimpAdapter = {
    createJimp: jest.fn(),
    read: jest.fn(),
  };
  const prototypeFileName = "prototypeFileName";
  const baseDirectory = "baseDirectory";
  let mockLocalPictureAccessorInstance: LocalPictureAccessor;

  let getPicture: GetPicture;

  beforeEach(() => {
    mockQuery.mockClear();
    mockLocalPictureAccessor.mockClear();
    mockJimpAdapter.createJimp.mockClear();
    mockJimpAdapter.read.mockClear();
    mockLocalPictureAccessorInstance = new LocalPictureAccessor(
      mockJimpAdapter,
      prototypeFileName,
      baseDirectory
    );
    getPicture = new GetPicture(mockDB, mockLocalPictureAccessorInstance);
  });

  it("returns id extracted from input on getInput", () => {
    const input = getPicture.getInput(body);
    expect(input).toEqual(body);
  });

  it("throws an api error when the input is missing id field", () => {
    expect(() => getPicture.getInput({})).toThrow(
      new APIError(400, "id must be provided, picture not returned")
    );
  });

  it("gets the filename from the database, requests picture contents, and returns them", async () => {
    const expectedFilename = "filename";
    const filenameArray = [{ filename: expectedFilename }];

    mockQuery.mockImplementation((text: string, params: string[]) => {
      text;
      params;
      return new Promise((resolve, reject) => {
        reject;
        resolve({ rows: filenameArray });
      });
    });

    const expectedContents = "expectedContents";
    const mockGetPicture =
      mockLocalPictureAccessorInstance.getPicture as jest.Mock;
    mockGetPicture.mockImplementation((filename: string) => {
      if (filename === expectedFilename) {
        return expectedContents;
      } else {
        throw new Error();
      }
    });

    const results = await getPicture.process(mockDB, body);

    expect(results).toEqual(expectedContents);
  });

  it("throws an api error when the database query fails", async () => {
    mockQuery.mockImplementation((query: string, params: any[]) => {
      query;
      params;
      throw new Error();
    });
    await expect(getPicture.process(mockDB, body)).rejects.toThrow(
      new APIError(500, "database issue, picture not fetched")
    );
  });

  it("throws an api error when the requst for picture contents fails", async () => {
    const mockGetPicture =
      mockLocalPictureAccessorInstance.getPicture as jest.Mock;
    mockGetPicture.mockImplementation((filename: string) => {
      filename;
      throw new Error();
    });
    await expect(getPicture.process(mockDB, body)).rejects.toThrow(
      new APIError(500, "database issue, picture not fetched")
    );
  });

  it("gives png content type by default", () => {
    const contentType = getPicture.getContentType();
    expect(contentType).toEqual("image/png");
  });

  it("uses passthrough output serialization by default", () => {
    const superCrazyOutput = { thing1: "thing1key", thing2: "thing2key" };
    const resultingSerializedOutput =
      getPicture.serializeOutput(superCrazyOutput);
    expect(resultingSerializedOutput).toEqual(superCrazyOutput);
  });
});

/*
    it('calls db query when procesing', async () => {
        const pictureArray = {
            picture: [{id: 1, name: 'name', createdBy: 'createdBy', filename: 'filename', filesystem: 'filesystem'}]
        };
        mockQuery.mockImplementation((query: string, params: any[]) => { query; params; return new Promise((resolve, reject) => { reject; resolve({ rows: pictureArray.picture })}); });
        const result = await getPicture.process({});

        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(`select * from picture;`, []);
        expect(result).toEqual(pictureArray);
    });
    */
