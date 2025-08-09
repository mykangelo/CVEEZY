import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
// import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
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
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const url = redirect ? `${route("login")}?redirect=${encodeURIComponent(redirect)}` : route("login");
        
        post(url, {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans">
            <Head title="Log in" />

            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Welcome Title */}
                    <h2
                        className="text-center text-4xl md:text-5xl font-bold text-[#2E404A] mb-8 leading-tight"
                        style={{ fontFamily: "Nunito Sans, sans-serif" }}
                    >
                        Welcome back! Please sign in
                    </h2>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-600">
                                {status}
                            </p>
                        </div>
                    )}

                    {/* Social login buttons (placeholders) */}
                    <div className="flex flex-col gap-4 mb-6">
                        <button
                            onClick={() =>
                                (window.location.href = "/auth/google/redirect")
                            }
                            className="w-full flex items-center justify-center border border-gray-200 rounded-lg py-2 text-base font-medium text-[#2E404A] bg-white hover:bg-gray-50 transition"
                        >
                            <span className="w-5 h-5 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                                G
                            </span>
                            Log in with Google
                        </button>
                        <button
                            onClick={() =>
                                (window.location.href = "/auth/apple/redirect")
                            }
                            className="w-full flex items-center justify-center border border-gray-200 rounded-lg py-2 text-base font-medium text-[#2E404A] bg-white hover:bg-gray-50 transition"
                        >
                            <span className="w-5 h-5 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                                🍎
                            </span>
                            Log in with Apple
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="mx-4 text-gray-400 font-medium">
                            OR
                        </span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-lg font-semibold text-[#2E404A] mb-2"
                                style={{
                                    fontFamily: "Nunito Sans, sans-serif",
                                }}
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[#bde3fa] placeholder-gray-400 text-[#222] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05A2FF] focus:border-transparent focus:z-10 text-lg bg-white"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                style={{
                                    fontFamily: "Nunito Sans, sans-serif",
                                }}
                                placeholder="Enter email"
                                autoFocus
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-lg font-semibold text-[#2E404A]"
                                    style={{
                                        fontFamily: "Nunito Sans, sans-serif",
                                    }}
                                >
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-lg text-[#05A2FF] hover:text-[#2196f3] transition-colors font-semibold"
                                        style={{
                                            fontFamily:
                                                "Nunito Sans, sans-serif",
                                        }}
                                    >
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[#bde3fa] placeholder-gray-400 text-[#222] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05A2FF] focus:border-transparent focus:z-10 text-lg bg-white"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                style={{
                                    fontFamily: "Nunito Sans, sans-serif",
                                }}
                                placeholder="Enter password"
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center">
                            <label className="flex items-center cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData(
                                            "remember",
                                            e.target.checked || false
                                        )
                                    }
                                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                />
                                <span
                                    className="ml-3 text-sm text-[#2E404A]"
                                    style={{
                                        fontFamily: "Nunito Sans, sans-serif",
                                    }}
                                >
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {/* Log In Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-lg text-white bg-[#05A2FF] hover:bg-[#2196f3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#05A2FF] transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    fontFamily: "Nunito Sans, sans-serif",
                                }}
                                disabled={processing}
                            >
                                {processing ? "Signing in..." : "Sign in"}
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <span
                                className="text-lg text-[#2E404A] font-semibold"
                                style={{
                                    fontFamily: "Nunito Sans, sans-serif",
                                }}
                            >
                                Don't have an account?{" "}
                                <Link
                                    href={route("register")}
                                    className="text-[#05A2FF] hover:text-[#2196f3] font-bold transition-colors"
                                    style={{
                                        fontFamily: "Nunito Sans, sans-serif",
                                    }}
                                >
                                    Sign up here
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
