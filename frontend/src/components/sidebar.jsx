import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronRight,
  BookCopy,
  ChartNoAxesCombined,
  BellRingIcon,
  ShieldCheck,
  UserRound,
  LogIn,
  LogOut,
  UserPlus,
  Library,
  Sliders
} from 'lucide-react';
import { sidebarStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../shared/AuthContext';

// Map icon string names to Lucide icon components
const iconMap = {
  dashboard: ChartNoAxesCombined,
  books: BookCopy,
  alerts: BellRingIcon,
  fines: BellRingIcon,
  admin: ShieldCheck,
  users: UserRound,
  students: UserRound,
  login: LogIn,
  signup: UserPlus,
  logout: LogOut,
  home: Library,
  settings: Sliders
};

// Default Navigation Items aligned with backend API routes and roles
export const ADMIN_NAV_ITEMS = [
  {
    label: "Admin Dashboard",
    description: "Overview, stats & overdue summary",
    href: "/admin/dashboard",
    match: "/admin/dashboard",
    icon: "dashboard",
  },
  {
    label: "Book Catalog",
    description: "Manage library book inventory",
    href: "/admin/catalog",
    match: "/admin/catalog",
    icon: "books",
  },
  {
    label: "Issue & Manage Books",
    description: "Manual book issuing, returns & fines",
    href: "/admin/books",
    match: "/admin/books",
    icon: "books",
  },
  {
    label: "Student Accounts",
    description: "View verified student profiles",
    href: "/admin/users",
    match: "/admin/users",
    icon: "users",
  },
  {
    label: "Fine Settings",
    description: "Update fine rates & max limits",
    href: "/admin/fines",
    match: "/admin/fines",
    icon: "alerts",
  },
];

export const STUDENT_NAV_ITEMS = [
  {
    label: "Student Dashboard",
    description: "Overview of issued books & pending fines",
    href: "/user/dashboard",
    match: "/user/dashboard",
    icon: "dashboard",
  },
  {
    label: "My Books",
    description: "View borrowed books and due dates",
    href: "/user/books",
    match: "/user/books",
    icon: "books",
  },
  {
    label: "Edit Profile",
    description: "Update contact and academic details",
    href: "/user/profile",
    match: "/user/profile",
    icon: "users",
  },
];

export const GUEST_NAV_ITEMS = [
  {
    label: "Student Dashboard",
    description: "Open issued books, fines, and profile details",
    href: "/user/dashboard",
    match: "/user",
    icon: "dashboard",
  },
  {
    label: "Admin Dashboard",
    description: "Manage student issues, returns, and fines",
    href: "/admin/dashboard",
    match: "/admin",
    icon: "admin",
  },
];

const renderIcon = (icon, className = "h-5 w-5") => {
  if (!icon) return null;
  if (typeof icon === 'function' || typeof icon === 'object') {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  if (typeof icon === 'string' && iconMap[icon]) {
    const IconComponent = iconMap[icon];
    return <IconComponent className={className} />;
  }
  return null;
};

const Sidebar = ({
  title = "shelfWise",
  subtitle = "Library Management Portal",
  badge = null,
  accent = null,
  logoImage = null,
  user = null,
  role = null,
  navItems = null,
  footerItems = null,
  currentPath = "",
  onLogout = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const currentUser = user || auth?.currentUser;
  const pathname = currentPath || location?.pathname || "";

  // Determine user role matching backend ('admin' or 'user')
  const effectiveRole = role || currentUser?.role || (accent === "admin" ? "admin" : "user");
  const isAuthenticated = Boolean(currentUser || (typeof window !== "undefined" && localStorage.getItem("library-auth-token")));

  // Determine dynamic navigation items based on backend role
  const resolvedNavItems =
    navItems && navItems.length > 0
      ? navItems
      : effectiveRole === "admin"
      ? ADMIN_NAV_ITEMS
      : isAuthenticated
      ? STUDENT_NAV_ITEMS
      : GUEST_NAV_ITEMS;

  // Logout handler aligned with backend JWT auth
  const handleLogout = (e) => {
    setIsOpen(false);
    if (onLogout) {
      onLogout(e);
    } else if (auth?.logout) {
      auth.logout();
      navigate("/login");
    } else {
      localStorage.removeItem("library-auth-token");
      localStorage.removeItem("library-auth-session");
      navigate("/login");
    }
  };

  // Determine footer buttons based on authentication status
  const resolvedFooterItems =
    footerItems && footerItems.length > 0
      ? footerItems
      : isAuthenticated
      ? [
          {
            label: "Logout",
            icon: "logout",
            kind: "primary",
            action: handleLogout,
          },
        ]
      : [
          { label: "Login", href: "/login", icon: "login", kind: "primary" },
          {
            label: "Sign Up",
            href: "/signup",
            icon: "signup",
            kind: "secondary",
          },
        ];

  // Role Badge text & style
  const isAdmin = effectiveRole === "admin";
  const displayBadge =
    badge ||
    (isAdmin
      ? "ADMIN DESK"
      : currentUser?.studentId
      ? `ID: ${currentUser.studentId}`
      : "STUDENT PORTAL");

  const badgeStyle = isAdmin ? s.badgeAdmin : s.badgeUser;

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={s.mobileMenuButton}
        aria-label="Open Navigation Menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Backdrop Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`${s.mobileOverlay} ${
          isOpen ? s.mobileOverlayOpen : s.mobileOverlayClosed
        }`}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`${s.sidebar} ${
          isOpen ? s.sidebarOpen : s.sidebarClosed
        }`}
      >
        {/* Header Section */}
        <div className={s.sidebarHeader}>
          <div className="flex flex-col">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className={s.logoWrapper}>
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className={s.logoImage} />
                ) : (
                  <Library className="h-6 w-6 text-library-gold" />
                )}
              </div>
              <h2 className={s.title}>{title}</h2>
            </Link>
            {subtitle && <p className={s.subtitle}>{subtitle}</p>}
            {displayBadge && (
              <div>
                <span className={`${s.badgeBase} ${badgeStyle}`}>
                  {displayBadge}
                </span>
              </div>
            )}
          </div>

          {/* Close Button for Mobile */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={s.closeButton}
            aria-label="Close Navigation Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className={s.nav}>
          {resolvedNavItems &&
            resolvedNavItems.map((item, index) => {
              const isActive =
                item.active !== undefined
                  ? item.active
                  : item.match
                  ? pathname.startsWith(item.match)
                  : item.href && pathname === item.href;

              return (
                <Link
                  key={item.href || index}
                  to={item.href || "#"}
                  onClick={(e) => {
                    if (item.onClick) {
                      item.onClick(e);
                    }
                    setIsOpen(false);
                  }}
                  className={`${s.navLink} ${
                    isActive ? s.navLinkActive : s.navLinkInactive
                  }`}
                >
                  <div
                    className={`${s.navIconWrapper} ${
                      isActive
                        ? s.navIconWrapperActive
                        : s.navIconWrapperInactive
                    }`}
                  >
                    {renderIcon(item.icon, "h-5 w-5")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={s.navLabel}>{item.label}</span>
                    {item.description && (
                      <span
                        className={`${s.navDescription} ${
                          isActive
                            ? s.navDescriptionActive
                            : s.navDescriptionInactive
                        }`}
                      >
                        {item.description}
                      </span>
                    )}
                  </div>

                  <ChevronRight
                    size={16}
                    className={`${s.navChevron} ${
                      isActive ? s.navChevronActive : s.navChevronInactive
                    }`}
                  />
                </Link>
              );
            })}
        </nav>

        {/* Footer Section */}
        {resolvedFooterItems && resolvedFooterItems.length > 0 && (
          <div className={s.footer}>
            {resolvedFooterItems.map((item, index) => {
              const isPrimary = item.kind === "primary";

              if (item.action || item.onClick) {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      if (item.action) item.action(e);
                      if (item.onClick) item.onClick(e);
                      setIsOpen(false);
                    }}
                    className={`${s.footerButton} ${
                      isPrimary
                        ? s.footerButtonPrimary
                        : s.footerButtonSecondary
                    }`}
                  >
                    <span className={s.footerIconWrapper}>
                      {renderIcon(item.icon, "h-4 w-4")}
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.href || "#"}
                  onClick={() => setIsOpen(false)}
                  className={`${s.footerLink} ${
                    isPrimary ? s.footerLinkPrimary : s.footerLinkSecondary
                  }`}
                >
                  <span className={s.footerIconWrapper}>
                    {renderIcon(item.icon, "h-4 w-4")}
                    <span>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
