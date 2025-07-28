import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
                <Head title="Register" />
                {/* Head Title */}
                <Header />

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Welcome Text */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Welcome back! Please
                        </h1>
                        <h1 className="text-4xl font-bold text-gray-800">
                            Sign Up
                        </h1>
                    </div>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-lg">
                    <div className="py-8 px-6 sm:px-10">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Full Name"
                                    className="block text-xl font-semibold text-gray-700 mb-2"
                                />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

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
                                    className="w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                    placeholder="Enter your email"
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="block text-xl font-semibold text-gray-700 mb-2"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                    placeholder="Enter your password"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                    className="block text-xl font-semibold text-gray-700 mb-2"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full !bg-[#05A2FF] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center"
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
                                    className="text-sm text-[#05A2FF] hover:text-blue-500 font-medium"
                                >
                                    Log in here
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}
