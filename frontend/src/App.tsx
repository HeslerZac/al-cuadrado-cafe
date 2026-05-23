import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kitchen from './pages/Kitchen';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Menu from './pages/Menu';
import WhatsApp from './pages/WhatsApp';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />

          <Route element={<AppLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/whatsapp" element={<WhatsApp />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/users" element={<Users />} />
            <Route path="/" element={<Navigate to="/admin" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;
