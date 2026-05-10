import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import { AppLayout } from "@/components/layout/AppLayout"

const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((module) => ({ default: module.Dashboard }))
)
const Leads = lazy(() =>
  import("@/pages/Leads").then((module) => ({ default: module.Leads }))
)
const Analytics = lazy(() =>
  import("@/pages/Analytics").then((module) => ({ default: module.Analytics }))
)
const Settings = lazy(() =>
  import("@/pages/Settings").then((module) => ({ default: module.Settings }))
)

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Centralized Toast Notifications */}
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
