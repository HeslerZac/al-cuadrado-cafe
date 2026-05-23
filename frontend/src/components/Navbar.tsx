import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">al cuadrado cafe</Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-500">Menú</Link>
          {user ? (
            <>
              {user.role === 'ADMIN' && <Link to="/admin" className="text-gray-600 hover:text-blue-500">Admin</Link>}
              <Link to="/kitchen" className="text-gray-600 hover:text-blue-500">Cocina</Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-600">Salir</button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
