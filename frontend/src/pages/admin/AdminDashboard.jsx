import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import { Users, BookCopy, AlertTriangle, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { adminLayoutStyles, adminDashboardStyles as s } from '../../assets/dummyStyles';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 42,
    issuedBooks: 18,
    overdueBooks: 4,
    totalFines: '$120.00',
  });

  const [overdueList, setOverdueList] = useState([
    {
      id: '1',
      studentName: 'Alex Johnson',
      rollNo: 'CS2026-012',
      department: 'Computer Science',
      bookTitle: 'Introduction to Algorithms (4th Ed)',
      fineAmount: '$45.00',
      daysOverdue: 9,
      dueDate: '2026-07-13',
    },
    {
      id: '2',
      studentName: 'Samantha Smith',
      rollNo: 'IT2026-088',
      department: 'Information Technology',
      bookTitle: 'Clean Code: Refactoring & Patterns',
      fineAmount: '$30.00',
      daysOverdue: 6,
      dueDate: '2026-07-16',
    },
  ]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('library-auth-token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/book/issues`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.issues) {
            const overdue = data.issues.filter(item => item.fineAmount > 0 || item.status === 'overdue');
            setOverdueList(overdue);
            setStats(prev => ({
              ...prev,
              issuedBooks: data.issues.length,
              overdueBooks: overdue.length,
            }));
          }
        }
      } catch (e) {
        console.error('API Fetch error:', e);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className={adminLayoutStyles.layoutContainer}>
      <Sidebar accent="admin" badge="ADMIN DESK" />

      <main className={adminLayoutStyles.mainContent}>
        <div className={`${adminLayoutStyles.innerContainer} ${s.container}`}>
          {/* Hero Section */}
          <section className={s.heroSection}>
            <div className={s.heroInner}>
              <div>
                <span className={s.badge}>LIBRARY ADMIN CONTROL CENTER</span>
                <h1 className={s.heading}>Library Operations &amp; Desk</h1>
                <p className={s.heroParagraph}>
                  Monitor student registrations, track manual book issuances, calculate dynamic late fines, and manage return records.
                </p>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className={s.statsGrid}>
            <div className={s.statCard}>
              <div className={s.statIcon}>
                <Users size={22} />
              </div>
              <p className={s.statLabel}>Total Active Students</p>
              <h3 className={s.statValue}>{stats.totalStudents}</h3>
              <p className={s.statNote}>Verified account records</p>
            </div>

            <div className={s.statCard}>
              <div className={s.statIcon}>
                <BookCopy size={22} />
              </div>
              <p className={s.statLabel}>Books Currently Issued</p>
              <h3 className={s.statValue}>{stats.issuedBooks}</h3>
              <p className={s.statNote}>Manual book transactions</p>
            </div>

            <div className={s.statCard}>
              <div className={s.statIcon}>
                <AlertTriangle size={22} />
              </div>
              <p className={s.statLabel}>Overdue Books</p>
              <h3 className={s.statValue}>{stats.overdueBooks}</h3>
              <p className={s.statNote}>Requires student follow-up</p>
            </div>

            <div className={s.statCard}>
              <div className={s.statIcon}>
                <DollarSign size={22} />
              </div>
              <p className={s.statLabel}>Accumulated Fines</p>
              <h3 className={s.statValue}>{stats.totalFines}</h3>
              <p className={s.statNote}>Pending student settlement</p>
            </div>
          </section>

          {/* Overdue Section */}
          <section className={s.overdueSection}>
            <div className={s.overdueHeader}>
              <div>
                <h2 className={s.overdueTitle}>Overdue &amp; Pending Fines</h2>
                <p className={s.overdueSubtitle}>
                  Students with overdue books and pending fine calculations.
                </p>
              </div>
              <div className={s.alertIcon}>
                <AlertTriangle size={24} />
              </div>
            </div>

            <div className={s.overdueGrid}>
              {overdueList.length > 0 ? (
                overdueList.map((item) => (
                  <div key={item.id} className={s.overdueCard}>
                    <span className={s.mostFineBadge}>Overdue Notice</span>
                    <div className={`${s.overdueCardInner} mt-3`}>
                      <div>
                        <h4 className={s.studentName}>{item.studentName}</h4>
                        <p className={s.studentDetails}>
                          Roll: {item.rollNo} • {item.department}
                        </p>
                        <h3 className={s.studentFine}>{item.fineAmount}</h3>
                      </div>

                      <div className={s.highestFineBookContainer}>
                        <span className={s.highestFineLabel}>Book Title</span>
                        <p className={s.highestFineTitle}>{item.bookTitle}</p>
                      </div>
                    </div>

                    <div className={s.detailsGrid}>
                      <div className={s.detailItem}>
                        Due Date: <strong>{item.dueDate}</strong>
                      </div>
                      <div className={s.detailItem}>
                        Overdue: <strong>{item.daysOverdue} Days</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={s.emptyState}>No overdue books found.</div>
              )}
            </div>

            <div className={s.viewMoreContainer}>
              <Link to="/admin/books" className={s.viewMoreLink}>
                Manage All Issued Books <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
