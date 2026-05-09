import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <BrowserRouter>
      {/* 
        This is a temporary placeholder. 
        In Phase 2+, we will add the Sidebar, Layout wrappers, and Dashboard pages here.
      */}
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">Phase 1 Setup Complete</h1>
        <p className="text-muted-foreground mb-8">
          Vite + React Query + Tailwind v4 + shadcn/ui are ready.
        </p>
      </div>

      {/* Centralized Toast Notifications */}
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
