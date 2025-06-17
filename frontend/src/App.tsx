import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartProvider } from '@/contexts/CartContext';
import NotFound from './pages/NotFound';
import PaymentReturn from './components/PaymentReturn';
import PaymentResult from '@/components/PaymentResult';
import Checkout from './pages/Checkout';
import Index from './pages/Index';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import MyOrders from './components/MyOrders';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/payment/return" element={<PaymentReturn />} />
                  <Route path="/payment/result" element={<PaymentResult />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
