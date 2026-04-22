import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { TelegramProvider } from './contexts/TelegramContext';
import MainLayout from './layout/MainLayout';
import AdminLayout from './layout/AdminLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LeadersPage from './pages/LeadersPage';
import DiscountsPage from './pages/DiscountsPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AIVisualizePage from './pages/AIVisualizePage';
import VisualizationsPage from './pages/VisualizationsPage';
import SharePage from './pages/SharePage';
import CompanyCreatePage from './pages/CompanyCreatePage';
import ProductCreatePage from './pages/ProductCreatePage';
import CreatorDashboard from './pages/CreatorDashboard';
import ProductFormPage from './pages/ProductFormPage';
import CompanyEditPage from './pages/CompanyEditPage';
import LeadListView from './pages/LeadListView';
import WishlistPage from './pages/WishlistPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminSystemPage from './pages/AdminSystemPage';
import VisualizePickerPage from './pages/VisualizePickerPage';
import OrderPage from './pages/OrderPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminLeadsPage from './pages/admin/AdminLeadsPage';
import AdminAIResultsPage from './pages/admin/AdminAIResultsPage';
import AdminAILabPage from './pages/admin/AdminAILabPage';

function App() {
  return (
    <Router>
      <TelegramProvider>
        <Routes>
          {/* Public Top-Level Pages */}
          <Route path="/share/:id" element={<SharePage />} />

          {/* Admin Panel */}
          <Route path="/adminka/login" element={<AdminLoginPage />} />
          <Route path="/adminka" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="promotions" element={<AdminPromotionsPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="ai-results" element={<AdminAIResultsPage />} />
            <Route path="ai-lab" element={<AdminAILabPage />} />
            <Route path="system" element={<AdminSystemPage />} />
          </Route>

          {/* Legacy /admin -> /adminka redirects */}
          <Route path="/admin" element={<Navigate to="/adminka" replace />} />
          <Route path="/admin/*" element={<Navigate to="/adminka" replace />} />

          {/* User-facing App */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/leaders" element={<LeadersPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/visualizations" element={<VisualizationsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/visualize/new" element={<VisualizePickerPage />} />
            <Route path="/product/:id/visualize" element={<AIVisualizePage />} />
            <Route path="/product/:id/ai-generate" element={<AIVisualizePage />} />
            <Route path="/product/:id/edit" element={<ProductFormPage />} />
            <Route path="/product/:id/order" element={<OrderPage />} />
            <Route path="/company/:id" element={<CompanyDetailPage />} />
            
            {/* Creator Dashboard Routes */}
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/creator/studio" element={<CreatorDashboard />} />
            <Route path="/creator/studio/edit" element={<CompanyEditPage />} />
            <Route path="/creator/product/add" element={<ProductFormPage />} />
            <Route path="/creator/product/edit/:id" element={<ProductFormPage />} />
            <Route path="/creator/leads" element={<LeadListView />} />
            
            {/* Legacy Compatibility / Fallbacks */}
            {/* Disabled to prevent regular users from creating companies/products
            <Route path="/company/create" element={<CompanyCreatePage />} />
            <Route path="/product/create" element={<ProductCreatePage />} />
            */}
          </Route>

          {/* Catch-all: unknown routes -> home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TelegramProvider>
    </Router>
  );
}

export default App;
