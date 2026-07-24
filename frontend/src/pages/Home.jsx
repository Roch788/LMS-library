import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import { BookMarked, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { homeStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../shared/AuthContext';

const features = [
  {
    icon: BookMarked,
    title: "Manual book issuing",
    text: "Track manual book issues, due dates, returns, and dynamic fine calculations in one workflow.",
  },
  {
    icon: Users,
    title: "Student self-service",
    text: "Students can review borrowed books, pending fines, academic details, and recent activity quickly.",
  },
  {
    icon: ShieldCheck,
    title: "Admin desk controls",
    text: "Library staff can manage student records, manual book issues, overdue items, and fine settings from the admin area.",
  },
];

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className={s.layoutContainer}>
      <Sidebar
        title="shelfWise"
        subtitle="Library Management Portal"
        badge={currentUser ? (currentUser.role === 'admin' ? 'ADMIN' : 'STUDENT') : 'Beautiful theme'}
      />

      <main className={s.mainContent}>
        <div className={s.innerContainer}>
          {/* Hero Section */}
          <section className={s.heroSection}>
            <div className={s.heroGrid}>
              <div>
                <span className={s.heroBadge}>Welcome to ShelfWise</span>
                <h1 className={s.heroTitle}>
                  Smart Library Management System
                </h1>
                <p className={s.heroText}>
                  Streamline book issuing, student records, fine tracking, and returns with a modern, fast interface.
                </p>
                <div className={s.heroButtons}>
                  {currentUser ? (
                    <Link
                      to={currentUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                      className={s.heroButtonPrimary}
                    >
                      Go to {currentUser.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'} <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className={s.heroButtonPrimary}>
                        Get Started <ArrowRight size={16} />
                      </Link>
                      <Link to="/signup" className={s.heroButtonSecondary}>
                        Register Account
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className={s.infoCard}>
                <span className={s.infoCardLabel}>Quick Overview</span>
                <h3 className={s.infoCardTitle}>Efficient &amp; Reliable</h3>
                <p className={s.infoCardText}>
                  Designed for both students and administrators to manage academic resources effortlessly.
                </p>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className={s.featuresGrid}>
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className={s.featureCard}>
                  <div className={s.featureIconWrapper}>
                    <IconComponent size={24} />
                  </div>
                  <h3 className={s.featureTitle}>{feature.title}</h3>
                  <p className={s.featureText}>{feature.text}</p>
                </div>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
