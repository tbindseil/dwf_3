import { createContext, useContext } from 'react';

export interface IPictureService {
  createPicture(createdBy: string, pictureName: string): Promise<void>;
}

export const PictureServiceContext = createContext<IPictureService | undefined>(undefined);

const PictureService = ({ children }: any) => {
  const pictureService = {
    async createPicture(createdBy: string, pictureName: string): Promise<void> {
      fetch('http://localhost:8080/picture', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createdBy: createdBy, name: pictureName }),
      })
        .then((result) => result.json())
        .then(
          (result) => console.log(`result is: ${result}`),
          (error) => console.log(`first catch and error is: ${error}`),
        )
        .catch((error) => console.log(`last catch and error is: ${error}`));
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

export const usePictureService = (): IPictureService => {
  const context = useContext<IPictureService | undefined>(PictureServiceContext);
  if (context === undefined) {
    throw new Error(
      'PictureServiceContext was not provided. Make sure your component is a child of the PictureService',
    );
  }
  return context;
};

export default PictureService;
