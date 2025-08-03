"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/verify");
    } else {
      const result = await res.json();
      setError(result.error || "Failed to sign up");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
        <div>
          <input
            name="firstName"
            type="text"
            placeholder="first name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="border w-full p-2"
          />
        </div>
        <div>
          <input
            name="lastName"
            type="text"
            placeholder="last name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="border w-full p-2"
          />
        </div>
        <div>
          <input
            name="email"
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border w-full p-2"
          />
        </div>

        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />
        <input
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div onClick={() => setShowPassword(!showPassword)}>
          show passwords
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "loading..." : "sign up"}
        </button>
      </form>
    </div>
  );
}
