import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
// import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";

export default function Login({
    status,
    canResetPassword,
    redirect,
    errors: serverErrors,
}: {
    status?: string;
    canResetPassword: boolean;
    redirect?: string;
    errors?: any;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string }>({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    // Check if user is already authenticated
    useEffect(() => {
        // If user is already logged in, redirect to dashboard
        if (window.location.pathname === '/login' && window.location.search.includes('already_authenticated')) {
            window.location.href = route('dashboard');
        }
    }, []);

    // Client-side validation
    const validateField = (field: string, value: string) => {
        if (!value.trim()) {
            return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
        if (field === 'email' && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    // Check if form is valid
    const isFormValid = () => {
        return !clientErrors.email && !clientErrors.password && data.email.trim() && data.password.trim();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        setHasAttemptedSubmit(true);
        
        // Validate all fields on submit
        const emailError = validateField('email', data.email);
        const passwordError = validateField('password', data.password);
        
        console.log('Validation errors:', { emailError, passwordError, email: data.email, password: data.password });
        
        setClientErrors({
            email: emailError,
            password: passwordError
        });
        
        // Don't submit if there are validation errors
        if (emailError || passwordError) {
            console.log('Form has validation errors, not submitting');
            return;
        }

        const url = redirect ? `${route("login")}?redirect=${encodeURIComponent(redirect)}` : route("login");
        
        post(url, {
            onFinish: () => {
                reset("password");
                setClientErrors({});
                setHasAttemptedSubmit(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans">
            <Head title="Log in" />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-6 -mt-16">
                    {/* Logo */}
                    <img
                        src="/images/cveezyLOGO_C.png"
                        alt="CVeezy Logo"
                        className="w-auto h-64 max-w-full mx-auto object-contain mb-0 -mb-20"
                    />

                    {/* Container Card */}
                    <div className="relative group">
                        {/* Main Container */}
                        <div className="relative bg-white rounded-[2rem] p-8 border-2 border-[#354eab]/40 transform transition-all duration-500 group-hover:scale-[1.02]">
                            {/* Welcome Title */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-[#354eab] mb-1">
                                    Welcome back!
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Ready to build your next resume?
                                </p>
                            </div>

                            {/* Server Error Display */}
                            {serverErrors?.social_login && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-800">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-sm font-medium">{serverErrors.social_login}</span>
                                    </div>
                                </div>
                            )}

                            {/* Success Message Display */}
                            {status && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-800">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">{status}</span>
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                    if (!hasAttemptedSubmit) {
                                        setClientErrors(prev => ({ ...prev, email: '' }));
                                    }
                                }}
                                className="w-full px-4 py-3 border-0 rounded-lg shadow-inner bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-opacity-50"
                                placeholder="E-mail"
                            />
                            {clientErrors.email && (
                                <InputError message={clientErrors.email} className="mt-1" />
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => {
                                    setData('password', e.target.value);
                                    if (!hasAttemptedSubmit) {
                                        setClientErrors(prev => ({ ...prev, password: '' }));
                                    }
                                }}
                                className="w-full px-4 py-3 border-0 rounded-lg shadow-inner bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-opacity-50"
                                placeholder="Password"
                            />
                            {clientErrors.password && (
                                <InputError message={clientErrors.password} className="mt-1" />
                            )}
                        </div>

                        {/* Form Options */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 text-[#354eab] focus:ring-[#354eab] border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href={route('password.request')}
                                className="text-sm text-[#354eab] hover:text-[#2d3f8f] transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-[#354eab] to-[#5b6fd8] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#2d3f8f] hover:to-[#4a5fc7] transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        disabled={isGoogleLoading}
                        onClick={async () => {
                            if (isGoogleLoading) return;
                            setIsGoogleLoading(true);
                            
                            try {
                                // Check authentication status before redirecting
                                const response = await fetch(route('auth.check-status'));
                                const data = await response.json();
                                
                                if (data.authenticated) {
                                    // User is already authenticated, redirect to dashboard
                                    window.location.href = route('dashboard');
                                    return;
                                }
                                
                                if (data.has_google_session) {
                                    // User has a recent Google session, redirect to dashboard
                                    window.location.href = route('dashboard');
                                    return;
                                }
                                
                                // Proceed with Google OAuth
                                window.location.href = route('social.redirect', 'google');
                            } catch (error) {
                                console.error('Error checking auth status:', error);
                                // Fallback to Google OAuth
                                window.location.href = route('social.redirect', 'google');
                            } finally {
                                setIsGoogleLoading(false);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting to Google...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center mt-8 pt-8 pb-6 border-t border-gray-200">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                className="text-[#354eab] hover:text-[#2d3f8f] font-medium transition-colors"
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
