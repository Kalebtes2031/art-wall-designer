import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Admin from './pages/Admin';
import Designer from './pages/Designer';

export default function App() {
  return (
    <Router>
      <nav style={{ padding: 10, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Designer</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Designer />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
