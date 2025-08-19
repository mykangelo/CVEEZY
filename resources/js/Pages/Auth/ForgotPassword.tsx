import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    return (
        <>
            <Head title="Forgot Password" />

            <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#e8f4fd] flex flex-col">
                {/* Header with Logo */}
                <Header />

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Title */}
                    <h2 className="text-center text-2xl font-semibold text-gray-700 mb-6">
                        Forgot your password?
                    </h2>

                    {/* Description */}
                    <div className="mb-6 text-center text-sm text-gray-600 leading-relaxed">
                        Enter the email address associated with your account
                        <br />
                        and we'll send you a link to reset your password.
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="text-xl block font-medium text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter email"
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

                        <div>
                            <PrimaryButton
                                className="w-full !bg-[#354eab] hover:bg-[#4a5fc7] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center flex items-center justify-center text-lg"
                                disabled={processing}
                            >
                                Send Reset Link
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}
