import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import { useAuth } from '../../shared/AuthContext';
import { Search, BookOpen, CheckCircle2, Clock, Send } from 'lucide-react';
import { userLayoutStyles, userBooksPageStyles as s, userBookCardStyles as c } from '../../assets/dummyStyles';

const API_BASE_URL = 'http://localhost:5000/api';

const CATEGORIES = [
  'General', 'Computer Science', 'Programming', 'Software Engineering',
  'Database Systems', 'AI & Machine Learning', 'Electronics',
  'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Chemistry',
];

const UserBooks = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('my-books');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [myBooks, setMyBooks] = useState([]);
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [requestingBookId, setRequestingBookId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const token = localStorage.getItem('library-auth-token');

  // Fetch my borrowed books
  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/book/issues/student`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.issues && data.issues.length > 0) {
            setMyBooks(data.issues);
          }
        }
      } catch (e) {
        console.error('Fetch student books error:', e);
      }
    };
    fetchMyBooks();
  }, []);

  // Fetch catalog books from API
  const fetchCatalog = async () => {
    if (!token) return;
    setLoadingCatalog(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery && activeTab === 'catalog') params.set('search', searchQuery);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);

      const res = await fetch(`${API_BASE_URL}/catalog/books?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCatalogBooks(data.books || []);
      }
    } catch (e) {
      console.error('Fetch catalog error:', e);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Fetch my requests
  const fetchMyRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Fetch requests error:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'catalog') fetchCatalog();
    if (activeTab === 'requests') fetchMyRequests();
  }, [activeTab, searchQuery, categoryFilter]);

  // Request a book
  const handleRequestBook = async (bookId) => {
    setRequestingBookId(bookId);
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Book request submitted!');
        fetchMyRequests();
      } else {
        showToast(data.message || 'Failed to request book', 'error');
      }
    } catch (e) {
      showToast('Error requesting book', 'error');
    } finally {
      setRequestingBookId(null);
    }
  };

  // Filter my borrowed books
  const filteredMyBooks = myBooks.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.bookCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Check if student already requested a book
  const hasRequestedBook = (bookId) => {
    return myRequests.some((r) => r.bookId === bookId && r.status === 'pending');
  };

  return (
    <div className={userLayoutStyles.layoutContainer}>
      <Sidebar accent="user" badge={currentUser?.studentId ? `ID: ${currentUser.studentId}` : 'STUDENT PORTAL'} />

      <main className={userLayoutStyles.mainContent}>
        <div className={`${userLayoutStyles.innerContainer} ${s.pageContainer}`}>

          {/* Toast */}
          {toast && (
            <div className={`fixed left-4 right-4 top-4 z-80 rounded-[22px] border bg-white px-4 py-4 text-sm font-semibold shadow-2xl sm:left-auto sm:right-5 sm:top-5 sm:px-5 ${
              toast.type === 'error' ? 'border-rose-200 text-rose-900' : 'border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-3">
                {toast.type === 'error' ? '✕' : '✓'} {toast.message}
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className={s.heroSection}>
            <div className={s.heroFlex}>
              <div>
                <span className={s.heroBadge}>ACADEMIC LIBRARY HOLDINGS</span>
                <h1 className={s.heroTitle}>Books &amp; Catalog Explorer</h1>
                <p className={s.heroText}>
                  View your currently issued books, browse the library catalog, request books, and track your requests.
                </p>
              </div>
            </div>
          </section>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-3 border-b border-library-ink/10 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('my-books')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === 'my-books'
                  ? 'bg-library-panel text-library-paper shadow-md'
                  : 'bg-white/80 text-library-ink hover:bg-library-paper'
              }`}
            >
              My Borrowed Books ({myBooks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === 'catalog'
                  ? 'bg-library-panel text-library-paper shadow-md'
                  : 'bg-white/80 text-library-ink hover:bg-library-paper'
              }`}
            >
              Explore Library Catalog ({catalogBooks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === 'requests'
                  ? 'bg-library-panel text-library-paper shadow-md'
                  : 'bg-white/80 text-library-ink hover:bg-library-paper'
              }`}
            >
              My Requests ({myRequests.length})
            </button>
          </div>

          {/* TAB 1: My Borrowed Books */}
          {activeTab === 'my-books' && (
            <section className={s.mainSection}>
              <div className={s.sectionHeader}>
                <div>
                  <h2 className={s.sectionTitle}>My Borrowed Items</h2>
                  <p className={s.sectionSubtitle}>Books currently checked out under your account.</p>
                </div>
              </div>

              <div className={s.filtersContainer}>
                <label className={s.filterLabel}>
                  <span className={s.filterLabelSpan}>Search Borrowed Books</span>
                  <div className={s.searchWrapper}>
                    <Search className={s.searchIcon} size={18} />
                    <input
                      type="text"
                      placeholder="Search by title or accession code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={s.searchInput}
                    />
                  </div>
                </label>
              </div>

              <div className={s.booksGrid}>
                {filteredMyBooks.length > 0 ? (
                  filteredMyBooks.map((book) => (
                    <div key={book._id} className={c.card}>
                      <div className={c.header}>
                        <h4 className={c.title}>{book.title}</h4>
                        <span className={`${c.statusBadge} ${
                          book.returnedOn ? 'bg-blue-100 text-blue-900' :
                          book.status === 'overdue' || (book.dueDate && new Date(book.dueDate) < new Date()) ? 'bg-rose-100 text-rose-900' :
                          'bg-emerald-100 text-emerald-900'
                        }`}>
                          {book.returnedOn ? 'RETURNED' :
                           book.status === 'overdue' || (book.dueDate && new Date(book.dueDate) < new Date()) ? 'OVERDUE' :
                           'ACTIVE'}
                        </span>
                      </div>

                      <div className={c.detailsGrid}>
                        <div className={c.detailBlock}>
                          <span className={c.detailLabel}>Accession Code</span>
                          <p className={c.detailValue}>{book.bookCode}</p>
                        </div>
                        <div className={c.detailBlock}>
                          <span className={c.detailLabel}>Issue Date</span>
                          <p className={c.numericValue}>{book.issuedOn || book.issueDate}</p>
                        </div>
                        <div className={c.detailBlock}>
                          <span className={c.detailLabel}>Return Due Date</span>
                          <p className={c.numericValue}>{book.dueDate}</p>
                        </div>
                        <div className={c.detailBlock}>
                          <span className={c.detailLabel}>Fine</span>
                          <p className={`${c.numericValue} font-bold ${
                            (book.manualFine || 0) > 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}>
                            ₹{book.manualFine || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={s.emptyState}>No borrowed books found.</div>
                )}
              </div>
            </section>
          )}

          {/* TAB 2: Library Catalog (Dynamic from DB) */}
          {activeTab === 'catalog' && (
            <section className={s.mainSection}>
              <div className={s.sectionHeader}>
                <div>
                  <h2 className={s.sectionTitle}>Library Book Catalog</h2>
                  <p className={s.sectionSubtitle}>Browse available titles, authors, and categories. Request books you need.</p>
                </div>
              </div>

              <div className={s.filtersContainer}>
                <label className={s.filterLabel}>
                  <span className={s.filterLabelSpan}>Search Catalog</span>
                  <div className={s.searchWrapper}>
                    <Search className={s.searchIcon} size={18} />
                    <input
                      type="text"
                      placeholder="Search title, author, code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={s.searchInput}
                    />
                  </div>
                </label>

                <label className={s.filterLabel}>
                  <span className={s.filterLabelSpan}>Category Filter</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={s.selectInput}
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mt-5">
                {loadingCatalog ? (
                  <div className={s.emptyState}>Loading catalog...</div>
                ) : catalogBooks.length > 0 ? (
                  catalogBooks.map((item) => (
                    <div key={item._id} className="flex flex-col justify-between rounded-[26px] border border-library-ink/10 bg-white/85 p-5 shadow-sm">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex rounded-full bg-library-paper px-3 py-1 text-xs font-bold text-library-ink/70">
                            {item.category}
                          </span>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            item.availableCopies > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {item.availableCopies > 0 ? `${item.availableCopies} Available` : 'All Issued'}
                          </span>
                        </div>

                        <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-library-ink">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-library-ink/65">
                          By <strong>{item.author}</strong>
                        </p>
                      </div>

                      <div>
                        <div className="mt-5 border-t border-library-ink/8 pt-3 text-xs text-library-ink/60 flex items-center justify-between">
                          <span>Code: <strong>{item.bookCode}</strong></span>
                          {item.publisher && <span>Publisher: <strong>{item.publisher}</strong></span>}
                        </div>

                        {/* Request Button */}
                        <div className="mt-3">
                          {hasRequestedBook(item._id) ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">
                              <Clock size={14} /> Request Pending
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRequestBook(item._id)}
                              disabled={requestingBookId === item._id}
                              className="inline-flex items-center gap-1.5 rounded-full bg-library-panel px-4 py-2 text-xs font-semibold text-library-paper transition hover:bg-library-panel-soft disabled:opacity-50"
                            >
                              <Send size={14} />
                              {requestingBookId === item._id ? 'Requesting...' : 'Request Book'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={s.emptyState}>
                    <BookOpen className="mx-auto mb-3 text-library-ink/30" size={40} />
                    <p>No books found in the catalog.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 3: My Requests */}
          {activeTab === 'requests' && (
            <section className={s.mainSection}>
              <div className={s.sectionHeader}>
                <div>
                  <h2 className={s.sectionTitle}>My Book Requests</h2>
                  <p className={s.sectionSubtitle}>Track the status of your book requests.</p>
                </div>
              </div>

              <div className="grid gap-4 mt-5">
                {myRequests.length > 0 ? (
                  myRequests.map((req) => (
                    <div key={req._id} className="rounded-[22px] border border-library-ink/10 bg-white/85 p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-library-ink">{req.bookTitle}</p>
                          <p className="mt-1 text-sm text-library-ink/60">
                            Code: <strong>{req.bookCode}</strong>
                          </p>
                          <p className="text-xs text-library-ink/50 mt-1">
                            Requested on: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {req.adminNote && (
                            <p className="mt-2 text-sm text-library-ink/65 italic">
                              Admin note: {req.adminNote}
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-900' :
                          'bg-rose-100 text-rose-900'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={s.emptyState}>
                    You haven't made any book requests yet. Browse the catalog to request books.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserBooks;
