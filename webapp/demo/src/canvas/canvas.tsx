import '../App.css';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { PutClientOutput } from 'dwf-3-models-tjb';

const ENDPOINT = 'http://127.0.0.1:6543/';

function Canvas() {
    const [response, setResponse] = useState('');
    useEffect(() => {
        const socket = io(ENDPOINT);
        socket.on('FromAP', data => {
            setResponse(data);
        });

        // TODO make the below strings in the model package?
        const pictureId = '3';
        socket.on('picture_response', (response: PutClientOutput) => {
            console.log(`stringified response is: ${JSON.stringify(response)}`);

            // https://stackoverflow.com/questions/26692575/html5-canvas-fastest-way-to-display-an-array-of-pixel-colors-on-the-screen
            // ctx2.drawImage(c1, 0, 0, 400, 300);

        });
        socket.emit('picture_request', );

    }, []);
    return (
        <div className="Canvas">
            canvas works
            <p>
                It's <time dateTime={response}>{response}</time>
            </p>
        </div>
    );
}

export default Canvas;
