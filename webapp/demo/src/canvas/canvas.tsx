import '../App.css';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ENDPOINT = 'http://127.0.0.1:6543/';

function Canvas() {
    const [response, setResponse] = useState('');
    useEffect(() => {
        const socket = io(ENDPOINT);
        socket.on('FromAP', data => {
            setResponse(data);
        });
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
