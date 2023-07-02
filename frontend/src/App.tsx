import './App.css';
import { SocketContext, socket } from './context/socket';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Canvas from './canvas/canvas';
import { PicturesScreen } from './components/pictures_screen'; // TODO screens index
import { HomeScreen } from './components/home_screen';
import { NewPictureScreen } from './components/new_picture_screen';

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <div className='App'>
        <BrowserRouter>
          <Routes>
            <Route path='/pictures' element={<PicturesScreen />} />
            <Route path='/new-picture' element={<NewPictureScreen />} />
            <Route path='/picture' element={<Canvas />} />
          </Routes>
        </BrowserRouter>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
