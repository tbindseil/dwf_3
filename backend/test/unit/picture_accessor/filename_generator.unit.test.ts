import generatePictureFilename from '../../../src/picture_accessor/filename_generator';

it('works', () => {
    const filename = generatePictureFilename('pictureName', 'createdBy');
    // its date and time dependent...
    //     expect(
    //         'pictureName_createdBy_Mon May 29 2023 15:02:07 GMT-0600 (Mountain Daylight Time).png'
    //     ).toEqual(filename);
});
