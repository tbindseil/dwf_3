import './App.css';
import { SocketContext, socket } from './context/socket';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { screens } from './components/screens';
import PictureService from './services/picture_service';

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <PictureService>
        <div className='App'>
          <BrowserRouter>
            <Routes>
              {screens.map((route) => (
                <Route
                  key={route.path.replace('/', '_')}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </BrowserRouter>
        </div>
      </PictureService>
    </SocketContext.Provider>
  );
}

export default App;
