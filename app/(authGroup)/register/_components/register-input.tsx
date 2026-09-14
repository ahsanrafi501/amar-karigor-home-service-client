"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { registerAction } from "@/app/(authGroup)/register/_actions/registerActions";

const RegisterForm = () => {
  const [state, action, pending] = useActionState(
    registerAction,
    {
      success: false,
      message: "",
    }
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message || "Registration successful");
    } else {
      toast.error(state.message || "Registration failed");
    }
  }, [state]);

  return (
    <form action={action}>
      <Card className="w-full space-y-5 rounded-[24px] border border-[#e4e9e6] bg-white p-7 shadow-[0_12px_40px_rgba(0,77,61,0.08)] sm:p-10">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-[#26332f]"
          >
            Full name
          </label>

          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
            className="h-12 rounded-xl border-[#dfe4e1] bg-[#fcfdfc] px-4 text-[15px] placeholder:text-[#aab2ae] shadow-none focus-visible:border-[#08785f] focus-visible:ring-4 focus-visible:ring-[#08785f]/10"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-[#26332f]"
          >
            Email address
          </label>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-12 rounded-xl border-[#dfe4e1] bg-[#fcfdfc] px-4 text-[15px] placeholder:text-[#aab2ae] shadow-none focus-visible:border-[#08785f] focus-visible:ring-4 focus-visible:ring-[#08785f]/10"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-[#26332f]"
          >
            Password
          </label>

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            required
            minLength={6}
            className="h-12 rounded-xl border-[#dfe4e1] bg-[#fcfdfc] px-4 text-[15px] placeholder:text-[#aab2ae] shadow-none focus-visible:border-[#08785f] focus-visible:ring-4 focus-visible:ring-[#08785f]/10"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-[#08785f] text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(8,120,95,0.18)] transition-all hover:bg-[#066b55] hover:shadow-[0_8px_20px_rgba(8,120,95,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Creating account..." : "Create account"}
        </Button>

        {/* Login */}
        <p className="pt-2 text-center text-sm text-[#7a8782]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#08785f] hover:text-[#066b55] hover:underline"
          >
            Login
          </Link>
        </p>
      </Card>
    </form>
  );
};

export default RegisterForm;