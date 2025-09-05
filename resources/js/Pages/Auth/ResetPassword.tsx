import Footer from "@/Components/Footer";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string; password_confirmation?: string }>({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const validateField = (field: string, value: string) => {
        if (field === "email") {
            if (!value.trim()) return "Email is required";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
            return "";
        }
        if (field === "password") {
            if (!value) return "Password is required";
            if (value.length < 12) return "Password must be at least 12 characters";
            if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter";
            if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return "Password must contain a special character";
            return "";
        }
        if (field === "password_confirmation") {
            if (!value) return "Please confirm your password";
            if (value !== data.password) return "Passwords do not match";
            return "";
        }
        return "";
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        const emailError = validateField("email", data.email);
        const passwordError = validateField("password", data.password);
        const confirmError = validateField("password_confirmation", data.password_confirmation);

        setClientErrors({ email: emailError, password: passwordError, password_confirmation: confirmError });

        if (emailError || passwordError || confirmError) return;

        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#e8f4fd] flex flex-col">
                <Head title="Reset Password" />
                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-4 pb-10">
                    <div className="w-full max-w-md space-y-1">
                        {/* Logo */}
                        <img
                            src="/images/cveezyLOGO_C.png"
                            alt="CVeezy Logo"
                            className="w-auto max-w-full mx-auto object-contain h-16 sm:h-20 md:h-24 lg:h-32 mb-0"
                        />

                        {/* Container Card */}
                        <div className="relative group">
                            {/* Main Container */}
                            <div className="relative bg-white rounded-[2rem] p-8 border-2 border-[#354eab]/40 transform transition-all duration-500 group-hover:scale-[1.02]">
                                {/* Title with Icon */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#354eab]/10 to-[#5b6fd8]/10 rounded-2xl mb-4">
                                        <svg className="w-8 h-8 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15.6A8 8 0 104.6 15.6L12 21l7.4-5.4z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-3xl font-bold text-[#354eab] mb-2">Reset Password</h1>
                                    <p className="text-gray-600 text-lg">Set a new password for your account.</p>
                                </div>

                                {/* Form */}
                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="email" value="Email" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="w-full px-3 py-2 border-2 rounded-xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 transition-all duration-300 border-gray-200/50 focus:border-[#354eab] hover:border-[#354eab]/50"
                                            autoComplete="username"
                                            onChange={(e) => {
                                                setData("email", e.target.value);
                                                if (!hasAttemptedSubmit) {
                                                    setClientErrors((prev) => ({ ...prev, email: "" }));
                                                }
                                            }}
                                        />
                                        <InputError message={clientErrors.email || (errors as any)?.email} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password" value="Password" />
                                        <div className="relative">
                                            <TextInput
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={data.password}
                                                className="w-full px-3 pr-12 py-2 border-2 rounded-xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 transition-all duration-300 border-gray-200/50 focus:border-[#354eab] hover:border-[#354eab]/50"
                                                autoComplete="new-password"
                                                isFocused={true}
                                                onChange={(e) => {
                                                    setData("password", e.target.value);
                                                    if (!hasAttemptedSubmit) {
                                                        setClientErrors((prev) => ({ ...prev, password: "" }));
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword((v) => !v)}
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
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={clientErrors.password || (errors as any)?.password} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                        <div className="relative">
                                            <TextInput
                                                id="password_confirmation"
                                                type={showPasswordConfirm ? "text" : "password"}
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                className="w-full px-3 pr-12 py-2 border-2 rounded-xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 transition-all duration-300 border-gray-200/50 focus:border-[#354eab] hover:border-[#354eab]/50"
                                                autoComplete="new-password"
                                                onChange={(e) => {
                                                    setData("password_confirmation", e.target.value);
                                                    if (!hasAttemptedSubmit) {
                                                        setClientErrors((prev) => ({ ...prev, password_confirmation: "" }));
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPasswordConfirm((v) => !v)}
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
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={clientErrors.password_confirmation || (errors as any)?.password_confirmation} className="mt-1" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-gradient-to-r from-[#354eab] to-[#5b6fd8] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#2d3f8f] hover:to-[#4a5fc7] transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}
