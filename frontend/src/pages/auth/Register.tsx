import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStorefront } from '../../context/TenantContext';
import { Sparkles, KeyRound, Mail, User, Phone } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { path } = useStorefront();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, phone, password });
      navigate(path('/menu'));
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a1316] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#121e22] border border-tastyc-copper/10 p-8 space-y-6 text-left">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-4 w-4 text-tastyc-copper" />
            <span className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Join Tastyc</span>
          </div>
          <h1 className="font-title text-4xl uppercase text-white tracking-widest">
            Register
          </h1>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-500/30 p-3 text-red-400 text-xs uppercase tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold flex items-center space-x-2">
              <User className="h-3.5 w-3.5 text-tastyc-copper" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 rounded-none text-white text-sm outline-none transition-colors duration-300"
              placeholder="e.g. John Doe"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold flex items-center space-x-2">
              <Mail className="h-3.5 w-3.5 text-tastyc-copper" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 rounded-none text-white text-sm outline-none transition-colors duration-300"
              placeholder="e.g. customer@example.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold flex items-center space-x-2">
              <Phone className="h-3.5 w-3.5 text-tastyc-copper" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 rounded-none text-white text-sm outline-none transition-colors duration-300"
              placeholder="e.g. +1 (555) 000-1122"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold flex items-center space-x-2">
              <KeyRound className="h-3.5 w-3.5 text-tastyc-copper" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 rounded-none text-white text-sm outline-none transition-colors duration-300"
              placeholder="••••••••"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white font-bold uppercase tracking-widest text-xs transition-colors duration-300 disabled:bg-[#a9b8c3]/20 disabled:text-[#a9b8c3]/40"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="border-t border-tastyc-copper/10 pt-4 text-center">
          <p className="text-xs text-[#a9b8c3]">
            Already have an account?{' '}
            <Link to={path('/login')} className="text-tastyc-copper hover:text-tastyc-copperLight font-semibold">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
