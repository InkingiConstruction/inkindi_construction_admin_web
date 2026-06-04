import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";
import { Button, Input, Label } from "../../../shared/components";
import FormFieldError from "../components/FormFieldError";
import AuthLayout from "../components/AuthLayout";
import AdminDashboardPreview from "../components/AdminDashboardPreview";
import Logo from "../../../assets/images/logo.svg";

const LoginPage: React.FC = () => {
  const { handleLogin, isLoading, error, clearError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
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
        className="grid w-full max-w-[900px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:grid-cols-2"
      >
        {/* Left: login form - reduced internal padding */}
        <div className="flex flex-col justify-between p-6 md:p-8">
          <div className="text-start">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your details to access the admin control center.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="mt-8 space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-800"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="rounded-xl border-gray-200 bg-white py-2.5 text-sm"
                value={formik.values.email}
                onChange={handleFieldChange}
                onBlur={formik.handleBlur}
              />
              <FormFieldError
                error={formik.errors.email}
                touched={formik.touched.email}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-800"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand hover:text-brand-dark"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="rounded-xl border-gray-200 bg-white py-2.5 pr-12 text-sm"
                  value={formik.values.password}
                  onChange={handleFieldChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormFieldError
                error={formik.errors.password}
                touched={formik.touched.password}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-white hover:bg-brand-dark"
              isLoading={isLoading}
              disabled={isLoading || !formik.isValid}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} InkingiPro. All rights reserved.
          </p>
        </div>

        {/* Right: marketing panel */}
        <div className="relative hidden flex-col overflow-hidden bg-brand p-8 text-white md:flex">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-white">
                <img src={Logo} alt="" className="h-7 w-7" />
              </div>
              <span className="text-xl font-bold">InkingiPro</span>
            </Link>

            <h2 className="mt-6 text-xl font-semibold lg:text-2xl">
              Construction operations,
              <br />
              managed in one place
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
              Review KYC submissions, oversee projects and escrow, resolve
              disputes, and keep your platform compliant — all from a single
              admin dashboard built for InkingiPro.
            </p>

            <AdminDashboardPreview />
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default LoginPage;