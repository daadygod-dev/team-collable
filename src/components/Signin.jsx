import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import toast, { Toaster } from "react-hot-toast";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { replace, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function validateInputs(email, password) {
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

export default function Signin() {
    const { signin, user } = useAuth();
    const navigate = useNavigate();

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

        const validationError = validateInputs(email, password);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setLoading(true);
        try {
            await signin(email, password);
            toast.success("Signed in successfully.");
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
                                    Signin
                                </h3>
                                <p className="text-neutral-500 mb-4">
                                    Welcome back! It's greate to see you!
                                </p>
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
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <FieldDescription>
                                        We&apos;ll keep you signed in securely.
                                    </FieldDescription>
                                </Field>

                                <Field orientation="horizontal" className="flex gap-2 mt-4">

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 text-white cursor-pointer w-full "
                                    >
                                        {loading ? (
                                            <Loader size={18} className="animate-spin" />
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>
                                </Field>
                                <p className="ml-2">
                                    First time here?
                                    <Link to={"/signup"} className="text-blue-800 ml-1">
                                        create an account
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