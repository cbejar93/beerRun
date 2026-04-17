import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BeerRunApp from './pages/BeerRunApp';
import MobilePreview from './pages/MobilePreview';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BeerRunApp />} />
        <Route path="/preview" element={<MobilePreview />} />
      </Routes>
    </BrowserRouter>
  );
}
