import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Planner from "@/pages/Planner";
import Budget from "@/pages/Budget";
import Analytics from "@/pages/Analytics";
import Trips from "@/pages/Trips";
import Settings from "@/pages/Settings";
import Wishlist from "@/pages/Wishlist";
import PageNotFound from "@/lib/PageNotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <VercelAnalytics />
    </BrowserRouter>
  );
}

export default App;
