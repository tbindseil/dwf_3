import './App.css';
import { SocketContext, socket } from './context/socket';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routes';

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <div className='App'>
        <BrowserRouter>
          <Routes>
            {routes.map((route) => (
              <Route path={route.path} element={route.element} />
            ))}
          </Routes>
        </BrowserRouter>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
