import React, { useState } from 'react';
import Sidebar from '../../components/sidebar';
import { useAuth } from '../../shared/AuthContext';
import { Edit2, CheckCircle2, UserCheck } from 'lucide-react';
import { userLayoutStyles, userEditProfilePageStyles as s } from '../../assets/dummyStyles';

const UserProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || 'Computer Science',
    stream: currentUser?.stream || 'B.Tech',
    semester: currentUser?.semester || 'Semester 5',
    academicYear: currentUser?.academicYear || '3rd Year',
    rollNumber: currentUser?.rollNumber || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await updateProfile(formData);
    setLoading(false);

    if (res.ok) {
      setToastMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className={userLayoutStyles.layoutContainer}>
      <Sidebar accent="user" badge={currentUser?.studentId ? `ID: ${currentUser.studentId}` : 'STUDENT PORTAL'} />

      {toastMessage && (
        <div className={s.toastWrapper}>
          <div className={s.toastContent}>
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <main className={userLayoutStyles.mainContent}>
        <div className={`${userLayoutStyles.innerContainer} ${s.pageContainer}`}>
          <section className={s.mainSection}>
            <div className={s.headerFlex}>
              <div>
                <h1 className={s.title}>Student Profile &amp; Academic Details</h1>
                <p className={s.subtitle}>
                  Manage your personal contact details, roll number, department, and academic year settings.
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
              {error && <div className={s.errorMessage}>{error}</div>}

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Full Name</span>
                  <input
                    type="text"
                    name="name"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={handleChange}
                    className={isEditing ? s.input : s.inputDisabled}
                  />
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Email Address</span>
                  <input
                    type="email"
                    name="email"
                    disabled
                    value={formData.email}
                    className={s.inputDisabled}
                  />
                  <span className={s.helperText}>Email address cannot be modified after verification.</span>
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Phone Number</span>
                  <input
                    type="tel"
                    name="phone"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={handleChange}
                    className={isEditing ? s.input : s.inputDisabled}
                  />
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Department</span>
                  <select
                    name="department"
                    disabled={!isEditing}
                    value={formData.department}
                    onChange={handleChange}
                    className={isEditing ? s.select : s.inputDisabled}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics &amp; Comm</option>
                    <option value="Mechanical Engineering">Mechanical Eng</option>
                  </select>
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Stream</span>
                  <select
                    name="stream"
                    disabled={!isEditing}
                    value={formData.stream}
                    onChange={handleChange}
                    className={isEditing ? s.select : s.inputDisabled}
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Roll Number</span>
                  <input
                    type="text"
                    name="rollNumber"
                    disabled={!isEditing}
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={isEditing ? s.input : s.inputDisabled}
                  />
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Semester</span>
                  <select
                    name="semester"
                    disabled={!isEditing}
                    value={formData.semester}
                    onChange={handleChange}
                    className={isEditing ? s.select : s.inputDisabled}
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </label>
              </div>

              <div>
                <label className={s.label}>
                  <span className={s.labelSpan}>Academic Year</span>
                  <select
                    name="academicYear"
                    disabled={!isEditing}
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={isEditing ? s.select : s.inputDisabled}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </label>
              </div>

              {isEditing && (
                <div className={s.buttonGroup}>
                  <button type="submit" disabled={loading} className={s.saveButton}>
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={s.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
