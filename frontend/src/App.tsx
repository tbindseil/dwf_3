import './App.css';
import { SocketContext, socket } from './context/socket';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { screens } from './components/screens';
import { GlobalServices } from './services/global_services';

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <GlobalServices>
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
      </GlobalServices>
    </SocketContext.Provider>
  );
}

export default App;
