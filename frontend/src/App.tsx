import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "./styles/toast.css";
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import MyOrders from './components/MyOrders';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "transparent",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            fontSize: "14px",
            padding: "16px",
            margin: "8px",
          },
          className: "custom-toast",
          classNames: {
            toast: "custom-toast-base",
            title: "custom-toast-title",
            description: "custom-toast-description",
            actionButton: "custom-toast-button",
            cancelButton: "custom-toast-cancel",
            success: "custom-toast-success",
            error: "custom-toast-error",
            warning: "custom-toast-warning",
            info: "custom-toast-info",
          }
        }}
      />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/my-orders" element={<MyOrders />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
