import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import { AppLayout } from "@/components/layout/AppLayout"
import { Dashboard } from "@/pages/Dashboard"
import { Leads } from "@/pages/Leads"
import { Analytics } from "@/pages/Analytics"
import { Settings } from "@/pages/Settings"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {/* Centralized Toast Notifications */}
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
