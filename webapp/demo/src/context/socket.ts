import React from 'react';
import { io } from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:6543/';

export const socket = io(ENDPOINT);
export const SocketContext = React.createContext(socket);
