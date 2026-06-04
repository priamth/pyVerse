import { NavLink, useLocation } from "react-router-dom";
import { Terminal, Github, Wrench, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group" data-testid="brand">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-secondary border border-border group-hover:border-primary transition-colors">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-lg tracking-tight">
              GEEK<span className="text-primary">VERSE</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              tools.exe — for the curious
            </div>
          </div>
        </NavLink>

        <nav className="flex items-center gap-7">
          <NavLink
            to="/"
            data-testid="nav-tools"
            className={`nav-link flex items-center gap-2 ${pathname === "/" ? "active" : ""}`}
          >
            <Wrench className="w-4 h-4" /> Tools
          </NavLink>
          <NavLink
            to="/github"
            data-testid="nav-github"
            className={`nav-link flex items-center gap-2 ${pathname === "/github" ? "active" : ""}`}
          >
            <Github className="w-4 h-4" /> GitHub
          </NavLink>
          <NavLink
            to="/admin"
            data-testid="nav-admin"
            className={`nav-link flex items-center gap-2 ${pathname === "/admin" ? "active" : ""}`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
