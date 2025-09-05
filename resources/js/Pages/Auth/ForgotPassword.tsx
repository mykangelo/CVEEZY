import InputError from "@/Components/InputError";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { Link } from "@inertiajs/react";
import Footer from "@/Components/Footer";

export default function ForgotPassword({ status }: { status?: string }) {
    const [clientError, setClientError] = useState<string>("");
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
    const [sentToEmail, setSentToEmail] = useState<string>("");
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        const trimmed = data.email.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        const msg = !trimmed
            ? "Email is required"
            : !isValid
            ? "Please enter a valid email address"
            : "";

        setClientError(msg);
        if (msg) return;

        post(route("password.email"), {
            onSuccess: () => {
                setHasAttemptedSubmit(false);
                setClientError("");
                setSentToEmail(trimmed);
            },
            onError: () => {
                // Server errors are available in `errors.email`
            },
            onFinish: () => {
                // no-op
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans">
            <Head title="Forgot Password" />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-[#354eab] mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
                            </div>

                            {(status || sentToEmail) && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                                    {status ? status : `We sent a reset link to ${sentToEmail}. Please check your inbox.`}
                                </div>
                            )}

                            {/* Reset Form */}
                            <form onSubmit={submit} className="space-y-6">
                                <div className="relative">
                                    <label htmlFor="email" className="sr-only">
                                        Email
                                    </label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => {
                                            setData('email', e.target.value);
                                            if (!hasAttemptedSubmit) {
                                                setClientError("");
                                            }
                                        }}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200/50 rounded-2xl bg-white/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#354eab]/20 focus:border-[#354eab] transition-all duration-300 hover:border-[#354eab]/50"
                                        placeholder="E-mail"
                                    />
                                </div>

                                {(clientError || (errors as any)?.email) && (
                                    <InputError message={(clientError || (errors as any)?.email) as string} className="mt-1" />
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-[#354eab] to-[#5b6fd8] text-white py-4 px-6 rounded-2xl font-semibold hover:from-[#2d3f8f] hover:to-[#4a5fc7] transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#354eab]/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {processing ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>

                            {/* Back to Sign In */}
                            <div className="text-center mt-8 pt-6 border-t border-gray-200/50">
                                <p className="text-gray-600">
                                    Remember your password?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-[#354eab] hover:text-[#2d3f8f] font-medium transition-colors hover:underline"
                                    >
                                        Back to Sign In
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
