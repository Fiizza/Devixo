import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "./Logo.jsx";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const CodeReviewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const GenerateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);
const BugFixIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navLinks = [
  { to: "/chat", label: "AI Chat", Icon: ChatIcon },
  { to: "/code-review", label: "Code Review", Icon: CodeReviewIcon },
  { to: "/generate", label: "Code Generator", Icon: GenerateIcon },
  { to: "/bugfix", label: "Bug Fixer", Icon: BugFixIcon },
  { to: "/profile", label: "Profile", Icon: UserIcon },
];

const HistorySkeleton = () => (
  <div className="space-y-2 px-2.5">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-100" style={{ animationDelay: `${i * 0.1}s` }} />
    ))}
  </div>
);

/**
 * history prop (optional): { groups, loading, onNewChat, onDelete, onSelect, activeId }
 * (search/onSearch no longer used here — search bar was removed)
 */
export default function Sidebar({ history = null }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/login"); };
  const closeMobile = () => setMobileOpen(false);
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <>
      {/* Mobile hamburger — top-left, only when drawer is closed */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      )}

      {/* Theme toggle — top-right, always visible on every screen size */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle theme"
        className="fixed right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:text-gray-900 cursor-pointer"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Backdrop on mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={closeMobile} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="mb-3 flex items-center justify-between px-1">
            <Link to="/" className="flex items-center cursor-pointer" onClick={closeMobile}>
              <Logo size={24} textClassName="text-sm" />
            </Link>
            <button onClick={closeMobile} className="text-gray-400 hover:text-gray-900 lg:hidden" aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>

          <nav className="space-y-0.5">
            <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">Workspace</p>
            {navLinks.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} end={to === "/chat"} onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-normal leading-tight transition-colors cursor-pointer ${
                    isActive ? "bg-gray-50 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-gray-700" : "text-gray-400"}><Icon /></span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {history && (
          <div className="flex flex-1 flex-col overflow-hidden border-t border-gray-100 px-3 pt-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">History</p>
              <button onClick={() => { history.onNewChat(); closeMobile(); }} title="New chat"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-normal text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 cursor-pointer">
                <PlusIcon />New
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pb-2">
              {history.loading ? (
                <HistorySkeleton />
              ) : (
                <>
                  {history.groups.length === 0 && (
                    <p className="px-2 text-sm text-gray-400">No conversations yet</p>
                  )}
                  {history.groups.map(([label, items]) => (
                    <div key={label}>
                      <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                      <div className="space-y-0.5">
                        {items.map((c) => (
                          <div key={c.id} onClick={() => { history.onSelect(c.id); closeMobile(); }}
                            className={`group flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-[13px] font-normal transition-colors ${
                              history.activeId === c.id ? "bg-gray-50 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}>
                            <span className="truncate">{c.title}</span>
                            <button onClick={(e) => history.onDelete(c.id, e)}
                              className="ml-1.5 hidden shrink-0 text-gray-300 transition-colors hover:text-red-500 group-hover:block cursor-pointer"
                              title="Delete" aria-label="Delete conversation">
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {!history && <div className="flex-1" />}

        {/* Bottom: user + logout only — kept compact so History above gets the space */}
        <div className="shrink-0 border-t border-gray-200 px-3 py-2">
          <div className="flex items-center gap-2 rounded-md px-1.5 py-1">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-tight text-gray-900">{user?.name}</p>
              <p className="truncate text-[11px] leading-tight text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-[13px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer">
            <LogoutIcon />Log out
          </button>
        </div>
      </aside>
    </>
  );
}
