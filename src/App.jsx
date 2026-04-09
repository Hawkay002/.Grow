import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import QrScanner from './pages/QrScanner';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* The Creator Journey */}
        <Route path="/" element={<Dashboard />} />
        
        {/* The Scanner Journey (Dynamic route expecting a unique ID) */}
        <Route path="/qr/:id" element={<QrScanner />} />
      </Routes>
    </Router>
  );
}
