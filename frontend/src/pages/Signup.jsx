import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, ShieldCheck, User, Mail, Phone, Lock, BookOpen } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';
import { signupStyles as s } from '../assets/dummyStyles';

const Signup = () => {
  const { registerStudent, verifyOtpCode, completeProfileData } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    otp: '',
    department: 'Computer Science',
    stream: 'B.Tech',
    semester: 'Semester 1',
    academicYear: '1st Year',
    rollNumber: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Register User & Trigger OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await registerStudent({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(res.message || 'Registration initialised! Verification OTP sent.');
      setStep(2);
    } else {
      setError(res.error || 'Failed to register. Please check input values.');
    }
  };

  // Step 2: Verify OTP
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await verifyOtpCode({
      email: formData.email,
      otp: formData.otp,
    });

    setLoading(false);
    if (res.ok) {
      setSuccess('Email verified! Now complete your academic profile.');
      setStep(3);
    } else {
      setError(res.error || 'Invalid OTP code. Please check and try again.');
    }
  };

  // Step 3: Complete Profile
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await completeProfileData({
      email: formData.email,
      department: formData.department,
      stream: formData.stream,
      semester: formData.semester,
      academicYear: formData.academicYear,
      rollNumber: formData.rollNumber,
    });

    setLoading(false);
    if (res.ok) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(res.error || 'Failed to complete profile.');
    }
  };

  return (
    <div className={s.pageContainer}>
      {/* Toast Notification */}
      {(error || success) && (
        <div className={`${s.toastBase} ${error ? s.toastError : s.toastSuccess}`}>
          <div className={s.toastContent}>
            <CheckCircle2 size={18} />
            <span>{error || success}</span>
          </div>
        </div>
      )}

      <div className={s.mainCard}>
        {/* Left Panel (Form) */}
        <div className={s.formPanel}>
          <div className={s.formInner}>
            <Link to="/login" className={`inline-flex items-center gap-2 ${s.backLink}`}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>

            <h2 className={s.panelTitle}>Student Registration</h2>
            <p className={s.panelSubtitle}>
              Create your library account in 3 simple steps.
            </p>

            {/* Step Indicators */}
            <div className={s.stepGrid}>
              <div className={`${s.stepCard} ${step >= 1 ? s.stepCardCompleted : s.stepCardPending}`}>
                <span className={s.stepLabel}>Step 1</span>
                <p className={s.stepTitle}>Account</p>
              </div>
              <div className={`${s.stepCard} ${step >= 2 ? s.stepCardCompleted : s.stepCardPending}`}>
                <span className={s.stepLabel}>Step 2</span>
                <p className={s.stepTitle}>OTP Code</p>
              </div>
              <div className={`${s.stepCard} ${step >= 3 ? s.stepCardCompleted : s.stepCardPending}`}>
                <span className={s.stepLabel}>Step 3</span>
                <p className={s.stepTitle}>Profile</p>
              </div>
            </div>

            {/* Step 1 Form */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className={s.form}>
                <div>
                  <label className={s.fieldLabel}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.fieldLabel}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.fieldLabel}>Phone Number (10 Digits)</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.fieldLabel}>Password</label>
                  <div className={s.passwordWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={s.passwordInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={s.toggleButton}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={s.buttonGroup}>
                  <button type="submit" disabled={loading} className={s.nextButton}>
                    {loading ? 'Processing...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2 Form */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className={s.form}>
                <div className={s.otpInfoBox}>
                  <span className={s.otpInfoLabel}>Email Verification</span>
                  <p className={s.otpInfoText}>
                    We sent a 6-digit OTP code to{' '}
                    <span className={s.emailHighlight}>{formData.email}</span>.
                  </p>
                </div>

                <div>
                  <label className={s.fieldLabel}>Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={formData.otp}
                    onChange={handleChange}
                    className={`${s.input} text-center tracking-[0.4em] font-mono text-lg`}
                  />
                </div>

                <div className={s.buttonGroup}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={s.backButton}
                  >
                    Back
                  </button>
                  <button type="submit" disabled={loading} className={s.nextButton}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 Form */}
            {step === 3 && (
              <form onSubmit={handleStep3Submit} className={s.form}>
                <div className={s.twoColumnGrid}>
                  <div>
                    <label className={s.fieldLabelBlock}>Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={s.select}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics &amp; Comm</option>
                      <option value="Mechanical Engineering">Mechanical Eng</option>
                      <option value="Civil Engineering">Civil Eng</option>
                    </select>
                  </div>

                  <div>
                    <label className={s.fieldLabelBlock}>Stream</label>
                    <select
                      name="stream"
                      value={formData.stream}
                      onChange={handleChange}
                      className={s.select}
                    >
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                    </select>
                  </div>
                </div>

                <div className={s.twoColumnGrid}>
                  <div>
                    <label className={s.fieldLabelBlock}>Semester</label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className={s.select}
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
                  </div>

                  <div>
                    <label className={s.fieldLabelBlock}>Academic Year</label>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleChange}
                      className={s.select}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={s.fieldLabelBlock}>Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    placeholder="CS2026-042"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={s.input}
                  />
                </div>

                <div className={s.buttonGroup}>
                  <button type="submit" disabled={loading} className={s.submitButton}>
                    {loading ? 'Finalising...' : 'Complete Profile & Register'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Panel (Info) */}
        <div className={s.infoPanel}>
          <span className={s.infoBadge}>
            <ShieldCheck size={14} /> Library Self-Service
          </span>

          <h1 className={s.infoTitle}>Start Reading Today</h1>

          <div className={s.infoList}>
            <div className={s.infoListItem}>
              <BookOpen className={s.infoIcon} size={20} />
              <span>Borrow books and track return due dates automatically</span>
            </div>
            <div className={s.infoListItem}>
              <CheckCircle2 className={s.infoIcon} size={20} />
              <span>View transparent fine calculations and active waivers</span>
            </div>
            <div className={s.infoListItem}>
              <User className={s.infoIcon} size={20} />
              <span>Manage your student academic profile seamlessly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
