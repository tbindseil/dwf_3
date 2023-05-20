import LocalPictureAccessor from "../../../src/picture_accessor/local_picture_accessor";
import generatePictureFilename from "../../../src/picture_accessor/filename_generator";
import { Raster } from "dwf-3-raster-tjb";
import * as fs from "fs";
import path from "path";
import Jimp from "jimp";

jest.mock("../../../src/picture_accessor/filename_generator");
const mockGeneratePictureFilename = jest.mocked(generatePictureFilename, true);

describe("LocalPictureAccessor tests", () => {
  // TODO, I wonder if I could write a more generatic basic mock factory? Maybe that is already done by jest
  // https://stackoverflow.com/questions/52122234/mock-a-typescript-interface-with-jest
  const mockJimpAdapter = {
    createJimp: jest.fn(),
    read: jest.fn(),
  };

  const testBaseDirectory =
    "/Users/tj/Projects/dwf_3/test_pictures/user_created/";
  const testPrototype =
    "/Users/tj/Projects/dwf_3/test_pictures/default/solid_white.png";

  const pictureName = "pictureName";
  const createdBy = "createdBy";
  const filename = "filename.png";
  const fullPathFilename = path.join(testBaseDirectory, filename);

  mockGeneratePictureFilename.mockImplementation(
    (pictureName: string, createdBy: string) => {
      pictureName;
      createdBy;
      return filename;
    }
  );

  let localPictureAccessor = new LocalPictureAccessor(
    mockJimpAdapter,
    testPrototype,
    testBaseDirectory
  );

  afterEach(async () => {
    try {
      await fs.promises.unlink(fullPathFilename);
    } catch (error: any) {
      error;
    }
  });

  it("gives filesystem as LOCAL", () => {
    const filesystem = localPictureAccessor.getFileSystem();
    expect(filesystem).toEqual("LOCAL");
  });

  it("creates a copy of the prototype when the filename doesn't exist", async () => {
    await localPictureAccessor.createNewPicture(pictureName, createdBy);

    const newFileContents = await fs.promises.readFile(fullPathFilename);
    const prototypeFileContents = await fs.promises.readFile(testPrototype);

    expect(newFileContents).toEqual(prototypeFileContents);
  });

  it("throws an exception when the requested filename already exists", async () => {
    await localPictureAccessor.createNewPicture(pictureName, createdBy);
    await expect(
      localPictureAccessor.createNewPicture(pictureName, createdBy)
    ).rejects.toThrow();
  });

  it("gets the picture given the filename", async () => {
    const data = "DATA_FOR_FILE";
    await fs.promises.writeFile(fullPathFilename, data);

    const buff = await localPictureAccessor.getPicture(filename);

    expect(buff).toEqual(Buffer.from(data));
  });

  it("throws when there is an issue reading the file", async () => {
    await expect(localPictureAccessor.getPicture(filename)).rejects.toThrow();
  });

  it("gets the raster given the filename", async () => {
    await fs.promises.copyFile(testPrototype, fullPathFilename);
    const jimg = await Jimp.read(fullPathFilename);

    mockJimpAdapter.read.mockReturnValue(jimg);

    const pictureResponse = await localPictureAccessor.getRaster(filename);

    expect(pictureResponse).toEqual({
      width: jimg.bitmap.width,
      height: jimg.bitmap.height,
      data: jimg.bitmap.data,
    });
  });

  it("writes the raster", async () => {
    const arrayBuffer = new ArrayBuffer(8);
    const view = new Uint8ClampedArray(arrayBuffer);
    for (let i: number = 0; i < 8; ++i) {
      view[i] = i;
    }
    const rasterToWrite = new Raster(1, 8, arrayBuffer);

    const mockJimg = {
      bitmap: {
        data: rasterToWrite.getBuffer(),
      },
      writeAsync: jest.fn(),
    };
    mockJimpAdapter.createJimp.mockReturnValue(mockJimg);

    localPictureAccessor.writeRaster(rasterToWrite);

    expect(mockJimg.writeAsync).toHaveBeenCalledWith(
      path.join(
        LocalPictureAccessor.testDirectory,
        LocalPictureAccessor.rasterWriteFileName
      )
    );
  });

  it("did not implement createNewPicture_with_dimensions method", () => {
    const ret = localPictureAccessor.createNewPicture_with_dimensions(1);
    expect(ret).toEqual("TODO");
  });

  it("throws when getRaster is called with a non existent file name", async () => {
    await expect(localPictureAccessor.getRaster("poopy")).rejects.toThrow();
  });
});
