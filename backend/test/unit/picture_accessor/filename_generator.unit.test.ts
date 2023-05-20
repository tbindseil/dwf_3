import generatePictureFilename from "../../../src/picture_accessor/filename_generator";

it("works", () => {
  const filename = generatePictureFilename("pictureName", "createdBy");
  filename;
});
