import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PrivateRoute from './components/guards/PrivateRoute'
import AdminRoute from './components/guards/AdminRoute'
import AuthBootstrap from './components/guards/AuthBootstrap'

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
import ProductsManager from './pages/admin/ProductsManager'
import UsersManager from './pages/admin/UsersManager'
import OrdersManager from './pages/admin/OrdersManager'
import HomepageEditor from './pages/admin/HomepageEditor'
import AIAssistant from './pages/admin/AIAssistant'
import AdminHomeRedirect from './pages/admin/AdminHomeRedirect'
import PagesManager from './pages/admin/PagesManager'
import CmsPagesIndex from './pages/CmsPagesIndex'
import CmsPageView from './pages/CmsPageView'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
        <a
          href="https://wa.me/0000000000"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 text-xs tracking-wider uppercase bg-green-500 text-white hover:bg-green-400 transition-colors"
        >
          WhatsApp
        </a>
        <a
          href="mailto:support@roguex.com"
          className="px-4 py-2 text-xs tracking-wider uppercase bg-gold text-noir hover:bg-gold-light transition-colors"
        >
          Contact Us
        </a>
      </div>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/auth/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/auth/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/order-success" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
        <Route path="/pages" element={<PublicLayout><CmsPagesIndex /></PublicLayout>} />
        <Route path="/p/:slug" element={<PublicLayout><CmsPageView /></PublicLayout>} />

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
          <Route index element={<AdminHomeRedirect />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="pages" element={<PagesManager />} />
          <Route path="homepage" element={<HomepageEditor />} />
          <Route path="ai" element={<AIAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
