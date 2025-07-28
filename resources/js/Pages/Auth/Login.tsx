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
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
            <Head title="Log in" />

            {/* Header with Logo */}
            <Header />

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 pb-10">
                <div className="w-full max-w-md">
                    {/* Welcome Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Welcome back! Please
                        </h1>
                        <h1 className="text-4xl font-bold text-gray-800">
                            Log In
                        </h1>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-600">
                                {status}
                            </p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email Address"
                                className="block text-xl font-semibold text-gray-700 mb-2"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="text-xl font-semibold text-gray-700"
                                />
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-[#05A2FF] hover:text-blue-600 transition-colors font-medium"
                                    >
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
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
                                <span className="ml-3 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {/* Log In Button */}
                        <PrimaryButton
                            disabled={processing}
                            className="w-full !bg-[#05A2FF] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center text-lg"
                        >
                            {processing ? "Logging in..." : "Log in"}
                        </PrimaryButton>
                    </form>

                    {/* Sign Up Link */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                href={route("register")}
                                className="text-[#05A2FF] hover:text-blue-600 font-medium transition-colors"
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
}
