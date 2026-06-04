import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import toast, { Toaster } from "react-hot-toast";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function validateInputs(fullnames, email, password) {
    if (!fullnames?.trim()) {
        return "Full name is required.";
    }
    if (!email?.trim()) {
        return "Email is required.";
    }
    if (!EMAIL_REGEX.test(email)) {
        return "Please enter a valid email address.";
    }
    if (!password?.trim()) {
        return "Password is required.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    return null;
}

export default function Signup() {
    const { signup,user } = useAuth();
    const navigate = useNavigate();

    const [fullnames, setFullnames] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
            if (user) {
                navigate("/dashboard", { replace: true });
            }
        }, [user,navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateInputs(fullnames, email, password);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setLoading(true);
        try {
            await signup(fullnames, email, password);
            toast.success("Account created successfully.");
            setTimeout(() => {
                navigate("/dashboard");
                setLoading(false);
            }, 1500);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    return (
        <main className="w-full p-8 flex justify-center items-center min-h-screen">
            <Toaster />
            <section className="flex justify-center items-center h-[80vh] rounded-2xl max-w-5xl w-full p-6">
                <Card className="w-full max-w-md border-none shadow-none rounded-2xl flex flex-col gap-2 justify-center items-center">
                    <CardHeader>
                        <CardTitle>
                            <img src="/logo.png" alt="Logo" width={50} height={50} loading="lazy" />
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="w-full">
                        <form onSubmit={handleSubmit} className="p-8">
                            <FieldGroup>
                                <h3 className="font-semibold text-neutral-700 text-xl">
                                    Create account
                                </h3>
                                <p className="text-neutral-500 mb-4">
                                    Welcome back! It's greate to see you!
                                </p>
                                <Field>
                                    <FieldLabel htmlFor="fieldgroup-fullnames">Full Name</FieldLabel>
                                    <Input
                                        id="fieldgroup-fullnames"
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullnames}
                                        onChange={(e) => setFullnames(e.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
                                    <Input
                                        id="fieldgroup-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
                                    <Input
                                        id="fieldgroup-password"
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <FieldDescription className={"ml-2"}>
                                        We&apos;ll keep your account secure.
                                    </FieldDescription>
                                </Field>

                                <Field orientation="horizontal" className="flex gap-2 mt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 text-white cursor-pointer w-full rounded-md"
                                    >
                                        {loading ? (
                                            <Loader size={18} className="animate-spin" />
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </Field>

                                <p className="ml-2">
                                    Already have an account?
                                    <Link to="/signin" className="text-blue-800 ml-1">
                                        Sign in
                                    </Link>
                                </p>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>

                <div className="w-full hidden md:block mask-l-from-50% mask-l-to-90%">
                    <img src="/dashboard.webp" alt="Dashboard-illustrations" className="object-cover w-full h-full rounded-2xl" />
                </div>
            </section>
        </main>
    );
}