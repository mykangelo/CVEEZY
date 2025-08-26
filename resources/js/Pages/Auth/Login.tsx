import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
// import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";

export default function Login({
    status,
    canResetPassword,
    redirect,
}: {
    status?: string;
    canResetPassword: boolean;
    redirect?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string }>({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

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
                        className="w-auto h-64 max-w-full mx-auto object-contain mb-0 -mb-24"
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

                    {/* Social Login */}
                    <div className="text-center">
                        <p className="text-gray-500 text-sm mb-4">Or Sign in with</p>
                        <div className="flex justify-center space-x-4">
                            <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </button>
                            <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                </svg>
                            </button>
                            <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

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
