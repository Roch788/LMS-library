import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, UserRound, ArrowLeft, BookOpen, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';
import { loginStyles as s } from '../assets/dummyStyles';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ email, password, role });
      if (res.ok) {
        if (res.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.mainCard}>
        {/* Left Panel (Info) */}
        <div className={s.infoPanel}>
          <div>
            <span className={s.roleBadge}>
              {role === 'admin' ? 'ADMINISTRATOR PORTAL' : 'STUDENT SELF-SERVICE'}
            </span>
            <h1 className={s.infoTitle}>
              {role === 'admin' ? 'Manage Library Desk' : 'Borrow & Read Books'}
            </h1>
            <p className={s.infoDescription}>
              Access issued books, due dates, automated fine tracking, and academic records in a sleek unified interface.
            </p>
          </div>

          <div className={s.infoBoxesContainer}>
            <div className={s.infoBox}>
              <span className={s.infoBoxTitle}>
                <BookOpen size={16} /> Instant Book Access
              </span>
              <p className={s.infoBoxText}>
                Check your currently borrowed books, return dates, and dynamic fine calculations anytime.
              </p>
            </div>
            <div className={s.infoBox}>
              <span className={s.infoBoxTitle}>
                <KeyRound size={16} /> Secure Authentication
              </span>
              <p className={s.infoBoxText}>
                Protected by JWT session authentication and role-based permissions for students and admins.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className={s.formPanel}>
          <div className={s.formInner}>
            <Link to="/" className={`inline-flex items-center gap-2 ${s.backLink}`}>
              <ArrowLeft size={16} /> Back to Home
            </Link>

            <h2 className={s.formTitle}>Sign In</h2>
            <p className={s.formSubtitle}>Select your account type and enter your credentials.</p>

            <form onSubmit={handleSubmit} className={s.form}>
              {/* Role Selection */}
              <div className={s.roleContainer}>
                <span className={s.roleLabel}>Account Type</span>
                <div className={s.roleGrid}>
                  <label
                    className={`${s.roleOption} cursor-pointer ${
                      role === 'user' ? s.roleOptionSelected : s.roleOptionUnselected
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={role === 'user'}
                      onChange={() => setRole('user')}
                      className={s.roleRadio}
                    />
                    <span className={s.roleIconLabel}>
                      <UserRound size={18} /> Student
                    </span>
                  </label>

                  <label
                    className={`${s.roleOption} cursor-pointer ${
                      role === 'admin' ? s.roleOptionSelected : s.roleOptionUnselected
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className={s.roleRadio}
                    />
                    <span className={s.roleIconLabel}>
                      <ShieldCheck size={18} /> Admin
                    </span>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && <div className={s.errorMessage}>{error}</div>}

              {/* Email Input */}
              <div>
                <label className={s.fieldLabel}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder={role === 'admin' ? 'admin@library.com' : 'student@college.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={s.input}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className={s.fieldLabel}>Password</label>
                <div className={s.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={s.passwordInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={s.togglePasswordButton}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={s.submitButton}>
                {loading ? 'Signing In...' : `Login as ${role === 'admin' ? 'Admin' : 'Student'}`}
              </button>

              <div className={s.footerFlex}>
                <span className={s.footerText}>Don't have an account?</span>
                <Link to="/signup" className={s.signupLink}>
                  Create Student Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
