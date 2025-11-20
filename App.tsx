import React, { useState, useEffect } from 'react';
import { NavItem, Product, RegulatoryCategory, User, Notification, MARGIN_LIMITS } from './types';
import { DashboardIcon, PillIcon, ChatIcon, ScanIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import Scanner from './components/Scanner';
import ChatAssistant from './components/ChatAssistant';
import Login from './components/Login';
import NotificationCenter from './components/NotificationCenter';
import { getCurrentUser, logout } from './services/authService';

// Define nav items with allowed roles
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, allowedRoles: ['admin', 'pharmacist', 'viewer'] },
  { id: 'products', label: 'Productos', icon: <PillIcon />, allowedRoles: ['admin', 'pharmacist'] },
  { id: 'scan', label: 'Escáner', icon: <ScanIcon />, allowedRoles: ['admin', 'pharmacist'] },
  { id: 'regulatory', label: 'Asistente Legal', icon: <ChatIcon />, allowedRoles: ['admin', 'pharmacist', 'viewer'] },
];

// Mock Initial Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Morfina 10mg Ampolla',
    category: RegulatoryCategory.FONDO_NACIONAL,
    purchasePrice: 5000,
    associatedCosts: 500,
    salePrice: 6875, // 25% margin
    currentStock: 5, // Low stock!
    initialStock: 50,
    soldQuantity: 45,
    expiryDate: '2025-12-31',
    lotNumber: 'L-998',
    invimaRegistration: 'INVIMA-2020M-0009'
  },
  {
    id: '2',
    name: 'Fenobarbital 100mg',
    category: RegulatoryCategory.MONOPOLIO_ESTADO,
    purchasePrice: 1200,
    associatedCosts: 100,
    salePrice: 1586, // 22% margin
    currentStock: 120,
    initialStock: 150,
    soldQuantity: 30,
    expiryDate: '2024-10-20',
    lotNumber: 'L-221',
    invimaRegistration: 'INVIMA-2019M-1120'
  }
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Auth Check on Mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  // Notification Logic
  useEffect(() => {
    if (!user) return;

    const checkAlerts = () => {
      const newNotifications: Notification[] = [];
      
      // 1. Stock Check
      const lowStock = products.filter(p => p.currentStock < 10);
      lowStock.forEach(p => {
        newNotifications.push({
          id: `stock-${p.id}-${Date.now()}`,
          type: 'critical',
          message: `Stock crítico: ${p.name} (${p.currentStock} unidades)`,
          timestamp: new Date(),
          read: false
        });
      });

      // 2. Expiry Check (Simulated)
      const expiring = products.filter(p => p.expiryDate.startsWith('2024')); // Simplistic check
      expiring.forEach(p => {
        newNotifications.push({
           id: `exp-${p.id}-${Date.now()}`,
           type: 'warning',
           message: `Próximo a vencer: ${p.name}`,
           timestamp: new Date(),
           read: false
        });
      });

      // 3. Regulatory Margin Check
      products.forEach(p => {
        const margin = ((p.salePrice - p.purchasePrice - p.associatedCosts) / p.salePrice) * 100;
        const limits = MARGIN_LIMITS[p.category];
        if (margin < limits.min || margin > limits.max) {
           newNotifications.push({
             id: `marg-${p.id}-${Date.now()}`,
             type: 'critical',
             message: `Desviación de margen: ${p.name} (${margin.toFixed(1)}%)`,
             timestamp: new Date(),
             read: false
           });
        }
      });

      // 4. Fake Regulatory Update (Randomly)
      if (Math.random() > 0.8) {
         newNotifications.push({
             id: `reg-${Date.now()}`,
             type: 'info',
             message: `Actualización INVIMA: Nueva circular sobre Monopolio del Estado.`,
             timestamp: new Date(),
             read: false
         });
      }

      // Merge ignoring duplicates (simple ID check logic needed in real app)
      // For demo, we just set them if empty or add unique
      if (newNotifications.length > 0) {
        setNotifications(prev => {
            const ids = new Set(prev.map(n => n.message)); // Dedupe by message content for demo
            const uniqueNew = newNotifications.filter(n => !ids.has(n.message));
            return [...uniqueNew, ...prev];
        });
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [products, user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setNotifications([]);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleScanComplete = (data: Partial<Product>) => {
    alert(`Datos escaneados:\nNombre: ${data.name}\nLote: ${data.lotNumber}\n\nVe a la pestaña Productos para agregar manualmente.`);
    setCurrentView('products');
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const filteredNavItems = NAV_ITEMS.filter(item => item.allowedRoles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">P</span>
            PharmaControl
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role === 'pharmacist' ? 'Regente' : user.role}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={currentView === item.id ? 'text-blue-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
           <div className="md:hidden flex items-center gap-4">
             <h1 className="font-bold text-blue-700">PharmaControl</h1>
           </div>
           
           {/* Mobile View Selector */}
           <select 
              onChange={(e) => setCurrentView(e.target.value)} 
              value={currentView} 
              className="md:hidden border p-1 rounded text-sm"
           >
             {filteredNavItems.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
           </select>

           {/* Right Side Actions */}
           <div className="flex items-center gap-4 ml-auto">
             <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
             <div className="hidden md:block text-xs text-gray-400">
                Versión 1.1.0
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === 'dashboard' && <Dashboard products={products} />}
            {currentView === 'products' && <ProductManager products={products} onAddProduct={handleAddProduct} currentUser={user} />}
            {currentView === 'scan' && <Scanner onScanComplete={handleScanComplete} />}
            {currentView === 'regulatory' && <ChatAssistant />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;