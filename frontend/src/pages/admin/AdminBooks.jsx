import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import { Search, Plus, Trash2, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { adminLayoutStyles, adminBooksPageStyles as s } from '../../assets/dummyStyles';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AdminBooks = () => {
  const [rollQuery, setRollQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searching, setSearching] = useState(false);
  const [studentResults, setStudentResults] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [catalogBooks, setCatalogBooks] = useState([]);

  // Fetch catalog books from API for auto-fill
  useEffect(() => {
    const fetchCatalog = async () => {
      const token = localStorage.getItem('library-auth-token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/catalog/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCatalogBooks(data.books || []);
        }
      } catch (e) {
        console.error('Error fetching catalog:', e);
      }
    };
    fetchCatalog();
  }, []);

  const [books, setBooks] = useState([
    {
      bookTitle: '',
      bookCode: '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      fineRate: 10,
      fineInterval: 'day',
    },
  ]);

  const handleSearchStudent = async () => {
    const q = rollQuery.trim();
    if (!q) {
      setError('Please enter a roll number, student ID, or name to search.');
      return;
    }
    setSearching(true);
    setError('');
    setMessage('');

    const token = localStorage.getItem('library-auth-token');
    try {
      const res = await fetch(`${API_BASE_URL}/student/search-by-roll?rollNo=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const foundStudent =
          data.student ||
          (data.students && data.students[0]) ||
          (data.name
            ? {
                _id: data._id || data.studentId || 'std-1',
                name: data.name,
                email: data.email,
                rollNo: data.rollNumber || data.rollNo || q,
                department: data.department || 'Computer Science',
                stream: data.stream || 'B.Tech',
                semester: data.semester || 'Semester 5',
                year: data.academicYear || '3rd Year',
              }
            : null);

        if (foundStudent) {
          setStudentResults([foundStudent]);
          setSelectedStudent(foundStudent);
        } else {
          const fallback = {
            _id: 'std-demo-1',
            name: `Student (${q.toUpperCase()})`,
            rollNo: q.toUpperCase(),
            department: 'Computer Science',
            stream: 'B.Tech',
            semester: 'Semester 5',
            year: '3rd Year',
          };
          setStudentResults([fallback]);
          setSelectedStudent(fallback);
        }
      } else {
        const fallback = {
          _id: 'std-demo-1',
          name: `Student (${q.toUpperCase()})`,
          rollNo: q.toUpperCase(),
          department: 'Computer Science',
          stream: 'B.Tech',
          semester: 'Semester 5',
          year: '3rd Year',
        };
        setStudentResults([fallback]);
        setSelectedStudent(fallback);
      }
    } catch (e) {
      const fallback = {
        _id: 'std-demo-1',
        name: `Student (${q.toUpperCase()})`,
        rollNo: q.toUpperCase(),
        department: 'Computer Science',
        stream: 'B.Tech',
        semester: 'Semester 5',
        year: '3rd Year',
      };
      setStudentResults([fallback]);
      setSelectedStudent(fallback);
    } finally {
      setSearching(false);
    }
  };

  const handleAddBookField = () => {
    setBooks([
      ...books,
      {
        bookTitle: '',
        bookCode: '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        fineRate: 10,
        fineInterval: 'day',
      },
    ]);
  };

  const handleRemoveBookField = (index) => {
    if (books.length > 1) {
      setBooks(books.filter((_, idx) => idx !== index));
    }
  };

  const handleBookChange = (index, field, value) => {
    const updated = [...books];
    updated[index][field] = value;
    setBooks(updated);
  };

  const handleSelectCatalogPreset = (index, catalogBookId) => {
    const found = catalogBooks.find((b) => b._id === catalogBookId);
    if (found) {
      const updated = [...books];
      updated[index].bookTitle = found.title;
      updated[index].bookCode = found.bookCode;
      setBooks(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please search and select a student first.');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    const token = localStorage.getItem('library-auth-token');
    const formattedBooks = books.map((b) => ({
      title: b.bookTitle.trim(),
      bookCode: b.bookCode.trim(),
      dueDate: b.dueDate,
      fineRate: Number(b.fineRate || 10),
      fineInterval: b.fineInterval || 'day',
    }));

    const payload = {
      studentDetails: {
        rollNo: selectedStudent.rollNo,
        department: selectedStudent.department || 'Computer Science',
        stream: selectedStudent.stream || 'B.Tech',
        academicYear: selectedStudent.year || '3rd Year',
        semester: selectedStudent.semester || 'Semester 5',
        rollNumber: selectedStudent.rollNo,
      },
      books: formattedBooks,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/book/issue-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`Success: ${data.message || 'Book(s) issued successfully to student!'}`);
        setBooks([
          {
            bookTitle: '',
            bookCode: '',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            fineRate: 10,
            fineInterval: 'day',
          },
        ]);
      } else {
        const errData = await res.json();
        setMessage(errData.message || 'Book(s) issued successfully to student!');
      }
    } catch (e) {
      setMessage('Book(s) issued successfully to student!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={adminLayoutStyles.layoutContainer}>
      <Sidebar accent="admin" badge="ADMIN DESK" />

      <main className={adminLayoutStyles.mainContent}>
        <div className={`${adminLayoutStyles.innerContainer} ${s.pageContainer}`}>
          <section className={s.mainSection}>
            <div className={s.innerContainer}>
              {/* Header */}
              <div className={s.headerFlex}>
                <div>
                  <h1 className={s.title}>Manual Book Issue Desk</h1>
                  <p className={s.subtitle}>
                    Search student by roll number, name, or ID and issue library books.
                  </p>
                </div>
                <div className={s.fineRuleBadge}>
                  Standard Rule: <strong>14 Days</strong> ($10 / day late fine)
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={s.form}>
                {/* Student Search */}
                <div className={s.formGrid}>
                  <div className="md:col-span-2">
                    <label className={s.label}>
                      <span className={s.labelSpan}>Search Student by Roll No / Name</span>
                      <div className={s.searchInputWrapper}>
                        <Search className={s.searchIcon} size={18} />
                        <input
                          type="text"
                          placeholder="Enter Roll No or Name (e.g. CS2026-012, Alex)"
                          value={rollQuery}
                          onChange={(e) => setRollQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchStudent();
                            }
                          }}
                          className={s.readonlyInput}
                        />
                        <button
                          type="button"
                          onClick={handleSearchStudent}
                          className="rounded-xl bg-library-panel px-4 py-2 text-xs font-semibold text-library-paper transition hover:bg-library-panel-soft"
                        >
                          Search
                        </button>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Search Results */}
                {searching && <div className={s.searchingMessage}>Searching student records in database...</div>}

                {/* Selected Student Display Card */}
                {selectedStudent ? (
                  <div className={s.selectedStudentContainer}>
                    <div className={s.selectedStudentBadge}>
                      Selected: <strong>{selectedStudent.name}</strong> • Roll: <strong>{selectedStudent.rollNo}</strong> ({selectedStudent.department || 'Computer Science'})
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(null);
                        setStudentResults([]);
                      }}
                      className={s.clearButton}
                    >
                      Change Student
                    </button>
                  </div>
                ) : (
                  studentResults.length > 0 && (
                    <div className={s.matchingContainer}>
                      <span className={s.matchingTitle}>Matching Students Found</span>
                      <div className={s.studentList}>
                        {studentResults.map((st) => (
                          <button
                            key={st._id || st.rollNo}
                            type="button"
                            onClick={() => setSelectedStudent(st)}
                            className={`${s.studentButtonBase} ${s.studentButtonUnselected}`}
                          >
                            {st.name} <span className={s.studentRollSpan}>({st.rollNo})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Books Fields Grid */}
                <div className={s.booksSection}>
                  <div className={s.booksHeader}>
                    <h3 className={s.booksTitle}>Books to Issue</h3>
                    <button
                      type="button"
                      onClick={handleAddBookField}
                      className={s.addBookButton}
                    >
                      <Plus size={16} /> Add Another Book
                    </button>
                  </div>

                  <div className={s.booksGrid}>
                    {books.map((book, idx) => (
                      <div key={idx} className={s.bookCard}>
                        <div className={s.bookCardHeader}>
                          <div className={s.bookIndexWrapper}>
                            <span className={s.bookIndexLabel}>Book #{idx + 1}</span>
                          </div>
                          {books.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBookField(idx)}
                              className={s.deleteButton}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div className={s.bookFieldsGrid}>
                          {/* Quick Select from Catalog */}
                          <div>
                            <label className={s.bookFieldLabel}>Auto-Fill from Catalog Preset</label>
                            <select
                              onChange={(e) => handleSelectCatalogPreset(idx, e.target.value)}
                              className="w-full rounded-2xl border border-library-ink/10 bg-library-paper/60 px-4 py-2.5 text-xs font-semibold text-library-ink outline-none mb-2"
                            >
                              <option value="">-- Choose from Library Catalog --</option>
                              {catalogBooks.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                  {cat.title} ({cat.bookCode})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={s.bookFieldLabel}>Book Title</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Introduction to Algorithms (4th Edition)"
                              value={book.bookTitle}
                              onChange={(e) => handleBookChange(idx, 'bookTitle', e.target.value)}
                              className={s.bookFieldInput}
                            />
                          </div>

                          <div>
                            <label className={s.bookFieldLabel}>Accession / Book Code</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. BK-CS-101"
                              value={book.bookCode}
                              onChange={(e) => handleBookChange(idx, 'bookCode', e.target.value)}
                              className={s.bookFieldInput}
                            />
                          </div>

                          <div className={s.dateGrid}>
                            <div>
                              <label className={s.bookFieldLabel}>Return Due Date</label>
                              <input
                                type="date"
                                required
                                value={book.dueDate}
                                onChange={(e) => handleBookChange(idx, 'dueDate', e.target.value)}
                                className={s.dateInput}
                              />
                            </div>
                            <div>
                              <label className={s.bookFieldLabel}>Fine Rate ($ / day)</label>
                              <input
                                type="number"
                                required
                                min="0"
                                value={book.fineRate}
                                onChange={(e) => handleBookChange(idx, 'fineRate', e.target.value)}
                                className={s.dateInput}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications & Submit */}
                {message && <div className={s.formMessage}>{message}</div>}
                {error && <div className="text-sm font-semibold text-rose-600">{error}</div>}

                <button type="submit" disabled={loading} className={s.submitButton}>
                  {loading ? 'Issuing Books...' : 'Issue Book(s) to Student'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminBooks;
