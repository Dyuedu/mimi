import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductManagementPage from './pages/ProductManagementPage';
import AddProductPage from './pages/AddProductPage';
import RevenuePage from './pages/RevenuePage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/revenue"
          element={
            <ProtectedRoute>
              <RevenuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
