import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [clientErrors, setClientErrors] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const validateField = (field: string, value: string) => {
        let error = '';
        
        switch (field) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 12) {
                    error = 'Password must be at least 12 characters';
                } else if (!/[A-Z]/.test(value)) {
                    error = 'Password must contain at least one uppercase letter';
                } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
                    error = 'Password must contain at least one special character';
                }
                break;
            case 'password_confirmation':
                if (!value) {
                    error = 'Please confirm your password';
                } else if (value !== data.password) {
                    error = 'Passwords do not match';
                }
                break;
        }
        
        setClientErrors(prev => ({ ...prev, [field]: error }));
        return error;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);
        
        // Validate all fields
        const nameError = validateField('name', data.name);
        const emailError = validateField('email', data.email);
        const passwordError = validateField('password', data.password);
        const passwordConfirmError = validateField('password_confirmation', data.password_confirmation);
        
        // If there are no errors, submit the form
        if (!nameError && !emailError && !passwordError && !passwordConfirmError) {
            post(route("register"), {
                onFinish: () => {
                    reset("password", "password_confirmation");
                    setClientErrors({
                        name: '',
                        email: '',
                        password: '',
                        password_confirmation: ''
                    });
                    setHasAttemptedSubmit(false);
                },
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans">
            <Head title="Register" />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-4">
                    {/* Logo */}
                    <img
                        src="/images/cveezyLOGO_C.png"
                        alt="CVeezy Logo"
                        className="w-auto h-48 max-w-full mx-auto object-contain mb-0 -mb-11"
                    />

                    {/* Container Card */}
                    <div className="relative group">
                        {/* Main Container */}
                        <div className="relative bg-white rounded-[2rem] p-4 border-2 border-[#354eab]/40 transform transition-all duration-500 group-hover:scale-[1.02]">
                            {/* Welcome Title */}
                            <div className="text-center mb-4">
                                <h1 className="text-xl font-bold text-[#354eab] mb-1">
                                    Welcome! Please Sign Up
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Create your account to start building your resume
                                </p>
                            </div>

                            {/* Registration Form */}
                            <form onSubmit={submit} className="space-y-3">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Full Name"
                                    className="block text-lg font-semibold text-gray-700 mb-1"
                                />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    placeholder="Enter your full name"
                                    className={`w-full px-3 py-2 border-2 rounded-xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 transition-all duration-300 ${
                                        clientErrors.name || errors.name 
                                            ? 'border-red-300 focus:border-red-500' 
                                            : 'border-gray-200/50 focus:border-[#354eab] hover:border-[#354eab]/50'
                                    }`}
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => {
                                        setData("name", e.target.value);
                                        if (!hasAttemptedSubmit) {
                                            setClientErrors(prev => ({ ...prev, name: '' }));
                                        }
                                        // Live validation
                                        if (e.target.value.trim()) {
                                            validateField('name', e.target.value);
                                        }
                                    }}
                                />
                                {/* Live Validation Rules */}
                                <div className="mt-1 text-xs text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${data.name.trim().length >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span>At least 2 characters</span>
                                    </div>
                                </div>
                                {(clientErrors.name || errors.name) && (
                                    <InputError
                                        message={clientErrors.name || errors.name}
                                        className="mt-1"
                                    />
                                )}
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="email"
                                    value="Email Address"
                                    className="block text-lg font-semibold text-gray-700 mb-1"
                                />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`w-full px-3 py-2 border-2 rounded-xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 transition-all duration-300 ${
                                        clientErrors.email || errors.email 
                                            ? 'border-red-300 focus:border-red-500' 
                                            : 'border-gray-200/50 focus:border-[#354eab] hover:border-[#354eab]/50'
                                    }`}
                                    placeholder="Enter your email"
                                    autoComplete="username"
                                    onChange={(e) => {
                                        setData("email", e.target.value);
                                        if (!hasAttemptedSubmit) {
                                            setClientErrors(prev => ({ ...prev, email: '' }));
                                        }
                                        // Live validation
                                        if (e.target.value.trim()) {
                                            validateField('email', e.target.value);
                                        }
                                    }}
                                />
                                {/* Live Validation Rules */}
                                <div className="mt-1 text-xs text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span>Valid email format (e.g., user@example.com)</span>
                                    </div>
                                </div>
                                {(clientErrors.email || errors.email) && (
                                    <InputError
                                        message={clientErrors.email || errors.email}
                                        className="mt-1"
                                    />
                                )}
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="block text-lg font-semibold text-gray-700 mb-1"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className={`w-full px-3 pr-12 py-2 border-2 rounded-xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 transition-all duration-300 ${
                                            clientErrors.password || errors.password 
                                                ? 'border-red-300 focus:border-red-500' 
                                                : 'border-gray-200/50 focus:border-[#354eab] hover:border-[#354eab]/50'
                                        }`}
                                        placeholder="Enter your password"
                                        autoComplete="new-password"
                                        onChange={(e) => {
                                            setData("password", e.target.value);
                                            if (!hasAttemptedSubmit) {
                                                setClientErrors(prev => ({ ...prev, password: '' }));
                                            }
                                            // Live validation
                                            if (e.target.value) {
                                                validateField('password', e.target.value);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                        aria-controls="password"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {/* Live Validation Rules */}
                                <div className="mt-1 text-xs text-gray-500 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${data.password.length >= 12 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span>At least 12 characters</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span>At least one uppercase letter</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span>At least one special character</span>
                                    </div>
                                </div>
                                {(clientErrors.password || errors.password) && (
                                    <InputError
                                        message={clientErrors.password || errors.password}
                                        className="mt-1"
                                    />
                                )}
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                    className="block text-lg font-semibold text-gray-700 mb-1"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="password_confirmation"
                                        type={showPasswordConfirm ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className={`w-full px-3 pr-12 py-2 border-2 rounded-xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 transition-all duration-300 ${
                                            clientErrors.password_confirmation || errors.password_confirmation 
                                                ? 'border-red-300 focus:border-red-500' 
                                                : 'border-gray-200/50 focus:border-[#354eab] hover:border-[#354eab]/50'
                                        }`}
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        onChange={(e) => {
                                            setData("password_confirmation", e.target.value);
                                            if (!hasAttemptedSubmit) {
                                                setClientErrors(prev => ({ ...prev, password_confirmation: '' }));
                                            }
                                            // Live validation
                                            if (e.target.value) {
                                                validateField('password_confirmation', e.target.value);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                        aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPasswordConfirm}
                                        aria-controls="password_confirmation"
                                        title={showPasswordConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showPasswordConfirm ? (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {/* Live Validation Rules */}
                                <div className="mt-1 text-xs text-gray-500 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${data.password_confirmation && data.password_confirmation === data.password ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span>Passwords must match</span>
                                    </div>
                                </div>
                                {(clientErrors.password_confirmation || errors.password_confirmation) && (
                                    <InputError
                                        message={clientErrors.password_confirmation || errors.password_confirmation}
                                        className="mt-1"
                                    />
                                )}
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full bg-gradient-to-r from-[#354eab] to-[#5b6fd8] text-white py-2.5 px-6 rounded-2xl font-semibold hover:from-[#2d3f8f] hover:to-[#4a5fc7] transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#354eab]/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    disabled={processing}
                                >
                                    {processing ? "Signing up..." : "SIGN UP"}
                                </PrimaryButton>
                            </div>

                            <div className="text-center">
                                <span className="text-sm text-gray-600">
                                    Already have an account?{" "}
                                </span>
                                <Link
                                    href={route("login")}
                                    className="text-sm text-[#354eab] hover:text-[#4a5fc7] font-medium"
                                >
                                    Log in here
                                </Link>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
