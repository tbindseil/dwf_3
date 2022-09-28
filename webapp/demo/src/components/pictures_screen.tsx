import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { SocketContext } from '../context/socket';
import { Picture } from 'dwf-3-models-tjb';




export function PicturesScreen() {

    // fetch pictures
    // display each as a button

    const socket = useContext(SocketContext);

    const [pictures, setPictures] = useState<Picture[]>([]);

    const fetchPictures = () => {
        // const pictures = 
        fetch('http://localhost:8080/pictures', {
                method: 'GET'
                // mode: 'cors',
                // headers: props.headers,
                // body: props.body
            })
                .then(result => result.json())
                .then(
                    result => console.log(`result is: ${result}`),
                    error => console.log(`first catch and error is: ${error}`)
                )
                .catch(error => console.log(`last catch and error is: ${error}`));
    }

    useEffect(() => {
        fetchPictures();
    }, []);

    const requestPictureFunction = (filename: string) => {
        socket.emit('picture_request', {filename: filename});
    };

    return (
        <div className="Pictures">
            canvas works
            <h2>
                Pic Your Pic
            </h2>
        </div>
    );
}

/*

            <button onClick={() => { requestPictureFunction(filename) }} >
                request white picture
            </button>
            <button onClick={() => { requestPictureFunction(redFilename) }} >
                request red picture
            </button>
            <button onClick={() => { requestPictureFunction(greenFilename) }} >
                request green picture
            </button>
            <button onClick={() => { requestPictureFunction(blueFilename) }} >
                request blue picture
            </button>
            <button onClick={() => { unsubscribeFunction(blueFilename) }} >
                unsubscribe
            </button>

            <br/>

            <canvas id='canvas'
                    ref={canvasRef}
                    onClick={click}>
            </canvas>


 */
