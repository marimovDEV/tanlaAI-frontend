import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TelegramProvider } from './contexts/TelegramContext';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LeadersPage from './pages/LeadersPage';
import DiscountsPage from './pages/DiscountsPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AIVisualizePage from './pages/AIVisualizePage';
import CompanyCreatePage from './pages/CompanyCreatePage';
import ProductCreatePage from './pages/ProductCreatePage';
import CreatorDashboard from './pages/CreatorDashboard';
import ProductFormPage from './pages/ProductFormPage';
import CompanyEditPage from './pages/CompanyEditPage';
import LeadListView from './pages/LeadListView';
import WishlistPage from './pages/WishlistPage';
import CompanyDetailPage from './pages/CompanyDetailPage';

function App() {
  return (
    <Router>
      <TelegramProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/leaders" element={<LeadersPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/product/:id/visualize" element={<AIVisualizePage />} />
            <Route path="/product/:id/ai-generate" element={<AIVisualizePage />} />
            <Route path="/product/:id/edit" element={<ProductFormPage />} />
            <Route path="/company/:id" element={<CompanyDetailPage />} />
            
            {/* Creator Dashboard Routes */}
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/creator/studio" element={<CreatorDashboard />} />
            <Route path="/creator/studio/edit" element={<CompanyEditPage />} />
            <Route path="/creator/product/add" element={<ProductFormPage />} />
            <Route path="/creator/product/edit/:id" element={<ProductFormPage />} />
            <Route path="/creator/leads" element={<LeadListView />} />
            
            {/* Legacy Compatibility / Fallbacks */}
            <Route path="/company/create" element={<CompanyCreatePage />} />
            <Route path="/product/create" element={<ProductCreatePage />} />
          </Route>
        </Routes>
      </TelegramProvider>
    </Router>
  );
}

export default App;
