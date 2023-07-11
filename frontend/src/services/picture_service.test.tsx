import { pictureService } from './picture_service';

describe('picture_service_test', () => {
  it('can call createPicture', () => {
    const createdBy = 'createdBy';
    const pictureName = 'pictureName';
    pictureService.createPicture(createdBy, pictureName);
  });
});
