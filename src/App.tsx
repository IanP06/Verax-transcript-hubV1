import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';

// Mock Auth Check (Replace with real auth later)
const isAuthenticated = true;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
