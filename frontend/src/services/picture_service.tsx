import {
  GetPicturesInput,
  GetPicturesOutput,
  PostPictureInput,
  PostPictureOutput,
  _schema,
} from 'dwf-3-models-tjb';
import Contextualizer from './contextualizer';
import ProvidedServices from './provided_services';
import Ajv from 'ajv';

// TJTAG main list
// 3. syncronize initial sync with updates that have happened since the last write
// - I think this^^ is done by getting a fresh raster on each addclient
// -- but its not because the raster hasn't been saved
// 4. can we reconnect successfully when the server goes down
// - no

export interface IPictureService {
  createPicture(input: PostPictureInput): Promise<PostPictureOutput>;
  getPictures(input: GetPicturesInput): Promise<GetPicturesOutput>;
}

export const PictureServiceContext = Contextualizer.createContext(ProvidedServices.PictureService);
export const usePictureService = (): IPictureService =>
  Contextualizer.use<IPictureService>(ProvidedServices.PictureService);

// might want to use a similar pattern to the backend
// so service object that utilizes virtuality to delegate owning the validator to child objects, probably overkill tho

const ajv = new Ajv({ strict: false });

const PictureService = ({ children }: any) => {
  const baseUrl = 'http://localhost:8080';
  const postPictureOutputValidator = ajv.compile(_schema.PostPictureOutput);
  const getPicturesOutputValidator = ajv.compile(_schema.GetPicturesInput);

  const pictureService = {
    async createPicture(input: PostPictureInput): Promise<PostPictureOutput> {
      // TODO
      // pass in route, method, contenttype as optional with default as json, i/o types,
      // then have a map of output type to validator
      const result = await (
        await fetch(`${baseUrl}/picture`, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            createdBy: input.createdBy,
            name: input.name,
            // TODO add this to the interface
            width: 1000,
            height: 1000,
          }),
        })
      ).json();

      if (!postPictureOutputValidator(result)) {
        throw new Error(`invalid response: ${result}`);
      }

      return result as PostPictureOutput;
    },

    // since this can be globally available as context,
    // we could have a current picture concept
    async getPictures(input: GetPicturesInput): Promise<GetPicturesOutput> {
      input;
      const result = await (
        await fetch('http://localhost:8080/pictures', {
          method: 'GET',
          mode: 'cors',
        })
      ).json();

      if (!getPicturesOutputValidator(result)) {
        throw new Error(`invalid response: ${result}`);
      }

      return result as GetPicturesOutput;
    },
  };

  return (
    <>
      <PictureServiceContext.Provider value={pictureService}>
        {children}
      </PictureServiceContext.Provider>
    </>
  );
};

export default PictureService;
