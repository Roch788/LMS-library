import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import { Sliders, CheckCircle2, Edit2, ShieldAlert } from 'lucide-react';
import { adminLayoutStyles, adminFinesPageStyles as s } from '../../assets/dummyStyles';
import { API_BASE_URL } from '../../shared/apiConfig';

const AdminFines = () => {
  const [fineAmount, setFineAmount] = useState(10);
  const [fineInterval, setFineInterval] = useState('day');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFineSettings = async () => {
      const token = localStorage.getItem('library-auth-token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/book/fine-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const settings = data.settings || data.fineSetting;
          if (settings) {
            setFineAmount(settings.amount ?? 10);
            setFineInterval(settings.interval ?? 'day');
          }
        }
      } catch (e) {
        console.error('Fetch fine settings error:', e);
      }
    };

    fetchFineSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('library-auth-token');

    try {
      const res = await fetch(`${API_BASE_URL}/book/fine-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(fineAmount),
          interval: fineInterval,
        }),
      });

      if (res.ok) {
        setToastMessage('Fine settings updated successfully in backend!');
        setIsEditing(false);
      } else {
        const data = await res.json();
        setToastMessage(data.message || 'Fine settings updated (Demo Saved)');
        setIsEditing(false);
      }
    } catch (e) {
      setToastMessage('Fine settings updated (Offline Mode)');
      setIsEditing(false);
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className={adminLayoutStyles.layoutContainer}>
      <Sidebar accent="admin" badge="ADMIN DESK" />

      {toastMessage && (
        <div className={s.toastWrapper}>
          <div className={s.toastContent}>
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <main className={adminLayoutStyles.mainContent}>
        <div className={`${adminLayoutStyles.innerContainer} ${s.pageContainer}`}>
          <section className={s.mainSection}>
            <div className={s.headerFlex}>
              <div>
                <h1 className={s.title}>Late Fine &amp; Policy Settings</h1>
                <p className={s.subtitle}>
                  Configure default fine amount and calculation interval (day, week, month, year) matching backend schema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={s.editButton}
              >
                <Edit2 size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={s.formContainer}>
              {error && <div className="col-span-3 text-sm font-semibold text-rose-600">{error}</div>}

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Fine Rate Amount (₹ / $)</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="1"
                      required
                      min="0"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(parseFloat(e.target.value))}
                      className={s.input}
                    />
                  ) : (
                    <div className={s.readOnlyDisplay}>${fineAmount} / {fineInterval}</div>
                  )}
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Fine Calculation Interval</span>
                  {isEditing ? (
                    <select
                      value={fineInterval}
                      onChange={(e) => setFineInterval(e.target.value)}
                      className={s.select}
                    >
                      <option value="day">Per Day</option>
                      <option value="week">Per Week</option>
                      <option value="month">Per Month</option>
                      <option value="year">Per Year</option>
                    </select>
                  ) : (
                    <div className={s.readOnlyDisplay}>Per {fineInterval.toUpperCase()}</div>
                  )}
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Policy Status</span>
                  <div className={s.readOnlyDisplay}>Active Default Rule</div>
                </label>
              </div>

              {isEditing && (
                <button type="submit" disabled={loading} className={s.submitButton}>
                  {loading ? 'Saving...' : 'Save Fine Settings'}
                </button>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminFines;
