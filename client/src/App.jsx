import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BeerRunApp from './pages/BeerRunApp';
import MobilePreview from './pages/MobilePreview';
import FaviconPreview from './pages/FaviconPreview';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BeerRunApp />} />
        <Route path="/preview" element={<MobilePreview />} />
        <Route path="/favicon-preview" element={<FaviconPreview />} />
      </Routes>
    </BrowserRouter>
  );
}
