import './App.css';
import { SocketContext, socket } from './context/socket';
import Canvas from './canvas/canvas';

function App() {
  return (
    <SocketContext.Provider value={socket}>
        <div className="App">
            <Canvas />
        </div>
    </SocketContext.Provider>
  );
}

export default App;
