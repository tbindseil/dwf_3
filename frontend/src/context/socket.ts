import React from 'react';
import { io } from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:6543/';

// I think the reason that there is funkiness going on
// with the commented out tests in broadcastmediator is because
// of this. Basically, we connect once and then use that connection
// maybe...
// maybei  could even keep a single private reference to the socket within the current_picture_service
export const socket = io(ENDPOINT);
export const SocketContext = React.createContext(socket);
