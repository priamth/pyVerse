import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import SettingsMenu from "@/components/SettingsMenu";
import Home from "@/pages/Home";
import GithubPage from "@/pages/GithubPage";
import AdminPage from "@/pages/AdminPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/github" element={<GithubPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="border-t border-border py-6 text-center text-xs font-mono text-muted-foreground space-y-1">
            <div data-testid="footer-tag">
              GEEKVERSE.LOCAL // built by curious humans · {new Date().getFullYear()}
            </div>
            <div data-testid="footer-copyright">
              © 2026 pTriangle by posay. All rights reserved. Made in Romania ʀᴏ
            </div>
          </footer>
          <SettingsMenu />
          <Toaster />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
