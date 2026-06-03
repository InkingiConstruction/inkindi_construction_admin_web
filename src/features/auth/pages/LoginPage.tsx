/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : LoginPage.tsx
 * WHAT THIS FILE DOES : Renders the admin portal login page
 * HOW IT DOES IT      : Uses Formik validation and the login hook for authentication
 * DATA SOURCE         : User credentials and backend auth API
 * DATA DESTINATION    : Admin portal UI and auth context
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

import { loginSchema } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';
import { Button, Input, Label } from '../../../shared/components';
import FormFieldError from '../components/FormFieldError';
import AuthLayout from '../components/AuthLayout';
import AdminDashboardPreview from '../components/AdminDashboardPreview';
import Logo from '../../../assets/images/logo.svg';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginPage: React.FC = () => {
  const { handleLogin, isLoading, error, clearError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: toFormikValidationSchema(loginSchema),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      await handleLogin(values);
      helpers.setSubmitting(false);
    },
  });

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    formik.handleChange(event);
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid w-full max-w-[1080px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:min-h-[640px] md:grid-cols-2"
      >
        {/* Left: login form */}
        <div className="flex flex-col justify-between p-8 md:p-10 lg:p-12">
          <div>
            <div className="mb-8 md:hidden">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="InkingiPro logo" className="h-8 w-8" />
                <span className="text-lg font-bold text-brand">InkingiPro</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500">Enter your details to access the admin control center.</p>

            <button
              type="button"
              disabled
              title="Google sign-in is not enabled for admin accounts"
              className="mt-8 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 opacity-60"
            >
              <GoogleIcon />
              Sign in with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 font-medium text-gray-400">or</span>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-800">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-xl border-gray-200 bg-white py-3 text-sm"
                  value={formik.values.email}
                  onChange={handleFieldChange}
                  onBlur={formik.handleBlur}
                />
                <FormFieldError error={formik.errors.email} touched={formik.touched.email} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-800">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="rounded-xl border-gray-200 bg-white py-3 pr-12 text-sm"
                    value={formik.values.password}
                    onChange={handleFieldChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(current => !current)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormFieldError error={formik.errors.password} touched={formik.touched.password} />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={event => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-brand hover:text-brand-dark">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-xl bg-brand text-sm font-bold text-white hover:bg-brand-dark"
                isLoading={isLoading}
                disabled={isLoading || !formik.isValid}
              >
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-brand hover:text-brand-dark">
                Register
              </Link>
            </p>
          </div>

          <p className="mt-10 text-xs text-gray-400">© {new Date().getFullYear()} InkingiPro. All rights reserved.</p>
        </div>

        {/* Right: marketing panel */}
        <div className="relative hidden flex-col overflow-hidden bg-brand p-10 text-white md:flex">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <img src={Logo} alt="" className="h-7 w-7" />
              </div>
              <span className="text-xl font-bold">InkingiPro</span>
            </Link>

            <h2 className="mt-10 text-3xl font-bold leading-tight lg:text-[2rem]">
              Construction operations,
              <br />
              managed in one place
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
              Review KYC submissions, oversee projects and escrow, resolve disputes, and keep your
              platform compliant — all from a single admin dashboard built for InkingiPro.
            </p>

            <AdminDashboardPreview />
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default LoginPage;
