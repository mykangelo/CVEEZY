import React from 'react';
import { useForm } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import Header from '@/Components/Header';

const Login: React.FC = () => {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  const handleForgotPasswordClick = () => {
    // Add forgot password logic here
  };

  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <h2 className="text-center text-4xl md:text-5xl font-bold text-[#2E404A] mb-8 leading-tight" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
            Welcome back! Please sign in
          </h2>

          {/* Social login buttons (placeholders) */}
          <div className="flex flex-col gap-4 mb-6">
            <button className="w-full flex items-center justify-center border border-gray-200 rounded-lg py-2 text-base font-medium text-[#2E404A] bg-white hover:bg-gray-50 transition">
              {/* Google icon placeholder */}
              <span className="w-5 h-5 bg-gray-300 rounded-full mr-2 flex items-center justify-center">G</span>
              Log in with Google
            </button>
            <button className="w-full flex items-center justify-center border border-gray-200 rounded-lg py-2 text-base font-medium text-[#2E404A] bg-white hover:bg-gray-50 transition">
              {/* Apple icon placeholder */}
              <span className="w-5 h-5 bg-gray-300 rounded-full mr-2 flex items-center justify-center"></span>
              Log in with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-400 font-medium">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-[#2E404A] mb-2" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-[#bde3fa] placeholder-gray-400 text-[#222] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05A2FF] focus:border-transparent focus:z-10 text-lg bg-white"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                placeholder="Enter email"
                autoFocus
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-lg font-semibold text-[#2E404A]" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-lg text-[#05A2FF] hover:text-[#2196f3] transition-colors font-semibold"
                  style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                >
                  Forgot your password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-[#bde3fa] placeholder-gray-400 text-[#222] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05A2FF] focus:border-transparent focus:z-10 text-lg bg-white"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                placeholder="Enter password"
              />
              {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-lg text-white bg-[#05A2FF] hover:bg-[#2196f3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#05A2FF] transition-colors shadow"
                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                disabled={processing}
              >
                {processing ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-lg text-[#2E404A] font-semibold" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-[#05A2FF] hover:text-[#2196f3] font-bold transition-colors"
                  style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                  // onClick={handleSignupClick} // Inertia navigation can be added here
                >
                  Sign up here
                </button>
              </span>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Login;
