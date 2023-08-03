import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { screens } from './components/screens';
import { GlobalServices } from './services/global_services';

function App() {
  return (
    <GlobalServices>
      <div className='App'>
        <BrowserRouter>
          <Routes>
            {screens.map((route) => (
              <Route key={route.path.replace('/', '_')} path={route.path} element={route.element} />
            ))}
          </Routes>
        </BrowserRouter>
      </div>
    </GlobalServices>
  );
}

export default App;
