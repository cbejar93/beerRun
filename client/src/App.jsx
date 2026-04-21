import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BeerRunApp from './pages/BeerRunApp';
import HostPage from './pages/HostPage';
import MobilePreview from './pages/MobilePreview';
import FaviconPreview from './pages/FaviconPreview';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BeerRunApp />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/preview" element={<MobilePreview />} />
        <Route path="/favicon-preview" element={<FaviconPreview />} />
      </Routes>
    </BrowserRouter>
  );
}
