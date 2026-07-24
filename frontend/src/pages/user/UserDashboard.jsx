import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import { useAuth } from '../../shared/AuthContext';
import { BookOpen, AlertCircle, DollarSign, User, Award, ArrowRight } from 'lucide-react';
import { userLayoutStyles, userDashboardPageStyles as s, userBookCardStyles as c } from '../../assets/dummyStyles';
import { API_BASE_URL } from '../../shared/apiConfig';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [issuedBooks, setIssuedBooks] = useState([
    {
      _id: 'b1',
      title: 'Introduction to Algorithms (4th Ed)',
      bookCode: 'BK-904812',
      issueDate: '2026-06-29',
      dueDate: '2026-07-13',
      fineAmount: '$45.00',
      status: 'overdue',
    },
    {
      _id: 'b2',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      bookCode: 'BK-410293',
      issueDate: '2026-07-10',
      dueDate: '2026-07-24',
      fineAmount: '$0.00',
      status: 'active',
    },
  ]);

  useEffect(() => {
    const fetchMyBooks = async () => {
      const token = localStorage.getItem('library-auth-token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/book/issues/student`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.issues) {
            setIssuedBooks(data.issues);
          }
        }
      } catch (e) {
        console.error('Fetch student books error:', e);
      }
    };

    fetchMyBooks();
  }, []);

  const overdueBooks = issuedBooks.filter((b) => b.status === 'overdue');
  const totalFineAmount = overdueBooks.reduce((acc, curr) => {
    const val = parseFloat((curr.fineAmount || '$0.00').replace(/[^0-9.]/g, '')) || 0;
    return acc + val;
  }, 0);

  return (
    <div className={userLayoutStyles.layoutContainer}>
      <Sidebar accent="user" badge={currentUser?.studentId ? `ID: ${currentUser.studentId}` : 'STUDENT PORTAL'} />

      <main className={userLayoutStyles.mainContent}>
        <div className={`${userLayoutStyles.innerContainer} ${s.pageContainer}`}>
          {/* Hero Section */}
          <section className={s.heroSection}>
            <div className={s.heroGrid}>
              <div className={s.heroLeft}>
                <span className={s.heroBadge}>STUDENT PORTAL</span>
                <h1 className={s.heroTitle}>Welcome back, {currentUser?.name || 'Student'}!</h1>
                <p className={s.heroText}>
                  Review your borrowed library books, upcoming return due dates, and pending late fine balances.
                </p>
              </div>

              {/* Right Profile & Semester Grid */}
              <div className={s.rightColumnGrid}>
                <div className={s.profileCard}>
                  <div className={s.profileHeader}>
                    <div>
                      <span className={s.profileLabel}>Student Profile</span>
                      <h3 className={s.profileName}>{currentUser?.name || 'Student Name'}</h3>
                    </div>
                    <div className={s.profileIconWrapper}>
                      <User size={22} />
                    </div>
                  </div>
                  <div className={s.profileDetails}>
                    <div className={s.profileDetailItem}>
                      Roll: <strong>{currentUser?.rollNumber || 'CS2026-042'}</strong>
                    </div>
                    <div className={s.profileDetailItem}>
                      Dept: <strong>{currentUser?.department || 'Computer Science'}</strong>
                    </div>
                  </div>
                </div>

                <div className={s.semesterCard}>
                  <div className={s.semesterHeader}>
                    <div>
                      <span className={s.semesterLabel}>Academic Semester</span>
                      <h3 className={s.semesterValue}>{currentUser?.semester || 'Semester 5'}</h3>
                    </div>
                    <div className={s.semesterIconWrapper}>
                      <Award size={22} />
                    </div>
                  </div>
                  <div className={s.semesterDetails}>
                    <div className={s.semesterDetailItem}>
                      Year: <strong>{currentUser?.academicYear || '3rd Year'}</strong>
                    </div>
                    <div className={s.semesterDetailItem}>
                      Stream: <strong>{currentUser?.stream || 'B.Tech'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className={s.statsGrid}>
            <div className={s.statCard}>
              <div className={s.statHeader}>
                <div className={s.statIconWrapper}>
                  <BookOpen size={22} />
                </div>
                <span className={s.statLiveBadge}>Active</span>
              </div>
              <p className={s.statLabel}>Currently Issued Books</p>
              <h3 className={s.statValue}>{issuedBooks.length}</h3>
              <p className={s.statNote}>Total borrowed books</p>
            </div>

            <div className={s.statCard}>
              <div className={s.statHeader}>
                <div className={s.statIconWrapper}>
                  <AlertCircle size={22} />
                </div>
                <span className={s.statLiveBadge}>Notice</span>
              </div>
              <p className={s.statLabel}>Overdue Books</p>
              <h3 className={s.statValue}>{overdueBooks.length}</h3>
              <p className={s.statNote}>Requires return to desk</p>
            </div>

            <div className={s.statCard}>
              <div className={s.statHeader}>
                <div className={s.statIconWrapper}>
                  <DollarSign size={22} />
                </div>
                <span className={s.statLiveBadge}>Balance</span>
              </div>
              <p className={s.statLabel}>Total Pending Fine</p>
              <h3 className={s.statValue}>${totalFineAmount.toFixed(2)}</h3>
              <p className={s.statNote}>Calculated at desk</p>
            </div>
          </section>

          {/* Recent Books Section */}
          <section className={s.recentSection}>
            <div className={s.recentHeader}>
              <div>
                <h2 className={s.recentTitle}>My Borrowed Books</h2>
                <p className={s.recentSubtitle}>
                  Issued books from the library with return deadlines.
                </p>
              </div>
              <Link to="/user/books" className={s.viewMoreButton}>
                View All Books <ArrowRight size={16} />
              </Link>
            </div>

            <div className={s.recentGrid}>
              {issuedBooks.length > 0 ? (
                issuedBooks.map((book) => (
                  <div key={book._id} className={c.card}>
                    <div className={c.header}>
                      <h4 className={c.title}>{book.title}</h4>
                      <span className={`${c.statusBadge} ${book.status === 'overdue' ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {book.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className={c.detailsGrid}>
                      <div className={c.detailBlock}>
                        <span className={c.detailLabel}>Accession Code</span>
                        <p className={c.detailValue}>{book.bookCode}</p>
                      </div>
                      <div className={c.detailBlock}>
                        <span className={c.detailLabel}>Issue Date</span>
                        <p className={c.numericValue}>{book.issueDate}</p>
                      </div>
                      <div className={c.detailBlock}>
                        <span className={c.detailLabel}>Return Due Date</span>
                        <p className={c.numericValue}>{book.dueDate}</p>
                      </div>
                      <div className={c.detailBlock}>
                        <span className={c.detailLabel}>Calculated Fine</span>
                        <p className={`${c.numericValue} font-bold ${book.fineAmount !== '$0.00' ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {book.fineAmount || '$0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={s.emptyRecentState}>No books currently issued.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
