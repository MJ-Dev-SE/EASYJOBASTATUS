import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Mail, Lock, UserPlus, User, AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0-9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(password));
  const isPasswordStrong = password.length > 0 && failedRules.length === 0;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = isPasswordStrong && passwordsMatch;

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      toast.error('Your password does not meet all the requirements yet.');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Send the confirmation link back to the site the user actually signed up
        // on, instead of falling back to the Supabase project's Site URL.
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setRegistered(true);
      toast.success('Registration successful!');
      // If auto-login is disabled (Supabase default), user needs to confirm email
      if (data?.session === null) {
        toast('Please check your email to confirm your account.', { icon: '📧' });
      } else if (data?.session) {
        navigate('/dashboard');
      }
    }
  };

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 font-serif">Check your email</h2>
          <p className="text-slate-600">
            We've sent a confirmation link to <span className="font-bold">{email}</span>. 
            Please click the link to activate your account.
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Tip: If you're developing locally, you can disable "Confirm Email" in your Supabase Auth settings to skip this step.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 font-serif">Join EasyJobStatus</h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">Start tracking your career wins today</p>
        </div>

        <Card className="p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 shadow-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 shadow-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 shadow-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {password.length > 0 && (
                <ul className="mt-3 space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                          passed ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {passed ? (
                          <Check className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`block w-full rounded-lg border bg-slate-50 py-2.5 pl-10 pr-10 shadow-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    confirmPassword.length > 0 && !passwordsMatch
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'
                  }`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
                    passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              isLoading={loading}
              disabled={!canSubmit || loading}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                <span className="bg-white px-4 text-slate-400">Already a member?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/login">
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                  Return to sign in
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
