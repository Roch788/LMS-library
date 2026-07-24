import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { adminLayoutStyles, adminCatalogPageStyles as s } from '../../assets/dummyStyles';
import { API_BASE_URL } from '../../shared/apiConfig';

const CATEGORIES = [
  'General', 'Computer Science', 'Programming', 'Software Engineering',
  'Database Systems', 'AI & Machine Learning', 'Electronics',
  'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Chemistry',
];

const AdminCatalog = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [requestFilter, setRequestFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '', author: '', bookCode: '', category: 'General',
    publisher: '', totalCopies: 1, description: '',
  });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const token = localStorage.getItem('library-auth-token');

  // Fetch catalog books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);

      const res = await fetch(`${API_BASE_URL}/catalog/books?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (requestFilter !== 'all') params.set('status', requestFilter);

      const res = await fetch(`${API_BASE_URL}/catalog/requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    if (activeTab === 'requests') fetchRequests();
  }, [activeTab, requestFilter]);

  // Add or edit book
  const handleSubmitBook = async (e) => {
    e.preventDefault();
    try {
      const url = editingBook
        ? `${API_BASE_URL}/catalog/books/${editingBook._id}`
        : `${API_BASE_URL}/catalog/books`;

      const res = await fetch(url, {
        method: editingBook ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || (editingBook ? 'Book updated!' : 'Book added!'));
        setShowModal(false);
        setEditingBook(null);
        setFormData({ title: '', author: '', bookCode: '', category: 'General', publisher: '', totalCopies: 1, description: '' });
        fetchBooks();
      } else {
        showToast(data.message || 'Error saving book', 'error');
      }
    } catch (err) {
      showToast('Error saving book', 'error');
    }
  };

  // Delete book
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Book deleted successfully');
        fetchBooks();
      } else {
        const data = await res.json();
        showToast(data.message || 'Error deleting book', 'error');
      }
    } catch (err) {
      showToast('Error deleting book', 'error');
    }
  };

  // Open edit modal
  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      bookCode: book.bookCode,
      category: book.category,
      publisher: book.publisher || '',
      totalCopies: book.totalCopies,
      description: book.description || '',
    });
    setShowModal(true);
  };

  // Open add modal
  const handleAddNew = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', bookCode: '', category: 'General', publisher: '', totalCopies: 1, description: '' });
    setShowModal(true);
  };

  // Update request status
  const handleUpdateRequest = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Request ${status} successfully`);
        fetchRequests();
      } else {
        const data = await res.json();
        showToast(data.message || 'Error updating request', 'error');
      }
    } catch (err) {
      showToast('Error updating request', 'error');
    }
  };

  return (
    <div className={adminLayoutStyles.layoutContainer}>
      <Sidebar accent="admin" badge="ADMIN DESK" />

      <main className={adminLayoutStyles.mainContent}>
        <div className={`${adminLayoutStyles.innerContainer} ${s.pageContainer}`}>

          {/* Toast */}
          {toast && (
            <div className={`${s.toastBase} ${toast.type === 'error' ? s.toastError : s.toastSuccess}`}>
              <div className={s.toastContent}>
                {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                {toast.message}
              </div>
            </div>
          )}

          {/* Header */}
          <section className={s.mainSection}>
            <div className={s.headerFlex}>
              <div>
                <h1 className={s.title}>Book Catalog Management</h1>
                <p className={s.subtitle}>
                  Add, edit, and manage library book inventory. View student book requests.
                </p>
              </div>
              <button type="button" onClick={handleAddNew} className={s.addButton}>
                <Plus size={18} /> Add New Book
              </button>
            </div>

            {/* Tabs */}
            <div className={`${s.tabsContainer} mt-5`}>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`${s.tabButton} ${activeTab === 'catalog' ? s.tabActive : s.tabInactive}`}
              >
                Book Catalog ({books.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={`${s.tabButton} ${activeTab === 'requests' ? s.tabActive : s.tabInactive}`}
              >
                Student Requests ({requests.length})
              </button>
            </div>

            {/* TAB: Catalog */}
            {activeTab === 'catalog' && (
              <>
                {/* Filters */}
                <div className={s.filtersContainer}>
                  <label className={s.filterLabel}>
                    <span className={s.filterLabelSpan}>Search Books</span>
                    <div className={s.searchWrapper}>
                      <Search className={s.searchIcon} size={18} />
                      <input
                        type="text"
                        placeholder="Search by title, author, or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={s.searchInput}
                      />
                    </div>
                  </label>

                  <label className={s.filterLabel}>
                    <span className={s.filterLabelSpan}>Category</span>
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

                {/* Books Grid */}
                <div className={s.booksGrid}>
                  {loading ? (
                    <div className={s.emptyState}>Loading books...</div>
                  ) : books.length > 0 ? (
                    books.map((book) => (
                      <div key={book._id} className={s.bookCard}>
                        <div>
                          <div className={s.bookCardHeader}>
                            <span className={s.categoryBadge}>{book.category}</span>
                            <span className={`${s.availabilityBadge} ${
                              book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                            }`}>
                              {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'All Issued'}
                            </span>
                          </div>
                          <h3 className={s.bookTitle}>{book.title}</h3>
                          <p className={s.bookAuthor}>By <strong>{book.author}</strong></p>
                        </div>

                        <div>
                          <div className={s.bookFooter}>
                            <span>Code: <strong>{book.bookCode}</strong></span>
                            <span>Copies: <strong>{book.totalCopies}</strong></span>
                          </div>
                          {book.publisher && (
                            <div className="text-xs text-library-ink/50 mt-1">
                              Publisher: {book.publisher}
                            </div>
                          )}
                          <div className={s.bookActions}>
                            <button type="button" onClick={() => handleEditBook(book)} className={s.editButton}>
                              <Pencil size={14} className="inline mr-1" /> Edit
                            </button>
                            <button type="button" onClick={() => handleDeleteBook(book._id)} className={s.deleteButton}>
                              <Trash2 size={14} className="inline mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={s.emptyState}>
                      <BookOpen className="mx-auto mb-3 text-library-ink/30" size={40} />
                      <p>No books found. Click "Add New Book" to start building your catalog.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB: Requests */}
            {activeTab === 'requests' && (
              <>
                {/* Filter by status */}
                <div className={`${s.filtersContainer} lg:grid-cols-1`}>
                  <label className={s.filterLabel}>
                    <span className={s.filterLabelSpan}>Filter by Status</span>
                    <select
                      value={requestFilter}
                      onChange={(e) => setRequestFilter(e.target.value)}
                      className={s.selectInput}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="all">All Requests</option>
                    </select>
                  </label>
                </div>

                <div className="mt-5 grid gap-4">
                  {requests.length > 0 ? (
                    requests.map((req) => (
                      <div key={req._id} className={s.requestCard}>
                        <div className={s.requestHeader}>
                          <div>
                            <p className={s.requestTitle}>{req.bookTitle}</p>
                            <p className={s.requestDetail}>
                              Code: <strong>{req.bookCode}</strong> • Requested by: <strong>{req.studentName}</strong> ({req.studentEmail})
                            </p>
                            <p className="text-xs text-library-ink/50 mt-1">
                              {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`${s.requestStatusBadge} ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-900' :
                            'bg-rose-100 text-rose-900'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                        {req.status === 'pending' && (
                          <div className={s.requestActions}>
                            <button type="button" onClick={() => handleUpdateRequest(req._id, 'approved')} className={s.approveButton}>
                              <CheckCircle2 size={14} className="inline mr-1" /> Approve
                            </button>
                            <button type="button" onClick={() => handleUpdateRequest(req._id, 'rejected')} className={s.rejectButton}>
                              <XCircle size={14} className="inline mr-1" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={s.emptyState}>
                      No {requestFilter !== 'all' ? requestFilter : ''} requests found.
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className={s.modalContent}>
            <h2 className={s.modalTitle}>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>

            <form onSubmit={handleSubmitBook} className={s.modalForm}>
              <label className={s.modalLabel}>
                <span className={s.modalLabelSpan}>Book Title *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={s.modalInput}
                />
              </label>

              <label className={s.modalLabel}>
                <span className={s.modalLabelSpan}>Author *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas H. Cormen"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className={s.modalInput}
                />
              </label>

              <label className={s.modalLabel}>
                <span className={s.modalLabelSpan}>Book Code / Accession *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. BK-CS-101"
                  value={formData.bookCode}
                  onChange={(e) => setFormData({ ...formData, bookCode: e.target.value })}
                  className={s.modalInput}
                  disabled={!!editingBook}
                />
              </label>

              <label className={s.modalLabel}>
                <span className={s.modalLabelSpan}>Category</span>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={s.modalSelect}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>

              <label className={s.modalLabel}>
                <span className={s.modalLabelSpan}>Publisher</span>
                <input
                  type="text"
                  placeholder="e.g. MIT Press"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className={s.modalInput}
                />
              </label>

              <label className={s.modalLabel}>
                <span className={s.modalLabelSpan}>Total Copies</span>
                <input
                  type="number"
                  min="1"
                  value={formData.totalCopies}
                  onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                  className={s.modalInput}
                />
              </label>

              <label className={`${s.modalLabel} md:col-span-2`}>
                <span className={s.modalLabelSpan}>Description (optional)</span>
                <textarea
                  placeholder="Brief description of the book..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={s.modalTextarea}
                />
              </label>

              <div className={s.modalButtons}>
                <button type="submit" className={s.modalSubmitButton}>
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className={s.modalCancelButton}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCatalog;
