import { useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Picture } from 'dwf-3-models-tjb';


export function PicturesScreen() {
    const navigate = useNavigate();

    const [pictures, setPictures] = useState<Picture[]>([]);

    const fetchPictures = () => {
        fetch('http://localhost:8080/pictures', {
                method: 'GET',
                mode: 'cors',
            })
                .then(result => result.json())
                .then(
                    result => setPictures(result.pictures),
                    error => console.log(`first catch and error is: ${error}`)
                )
                .catch(error => console.log(`last catch and error is: ${error}`));
    }

    useEffect(() => {
        fetchPictures();
    }, []);

    const goToPicture = (picture: Picture) => {
        navigate('/picture', {state: {picture: picture, replace: true}});
    };

    return (
        <div className="Pictures">
            canvas works
            <h2>
                Pic Your Pic
            </h2>
            {
                pictures.map(picture => {
                    return (
                        <button onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { void event; goToPicture(picture)}}>
                            {`${picture.name} by ${picture.createdBy}`}
                        </button>
                    );
                })
            }
        </div>
    );
}
