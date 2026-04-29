import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PrivateRoute from './components/guards/PrivateRoute'
import AdminRoute from './components/guards/AdminRoute'

// Pages
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProductsManager from './pages/admin/ProductsManager'
import UsersManager from './pages/admin/UsersManager'
import OrdersManager from './pages/admin/OrdersManager'
import HomepageEditor from './pages/admin/HomepageEditor'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/auth/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/auth/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/order-success" element={<PublicLayout><OrderSuccess /></PublicLayout>} />

        {/* Protected routes */}
        <Route path="/checkout" element={
          <PublicLayout>
            <PrivateRoute><Checkout /></PrivateRoute>
          </PublicLayout>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute><AdminLayout /></AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="homepage" element={<HomepageEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
