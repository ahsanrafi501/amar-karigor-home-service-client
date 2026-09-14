"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { loginAction } from "@/app/(authGroup)/login/_actions/loginActions";

const LoginForm = () => {
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") ?? "";

  const [state, action, pending] = useActionState(
    loginAction.bind(null, redirectTo),
    {
      success: false,
      message: "",
    }
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message || "Login successful");
    } else {
      toast.error(state.message || "Login failed");
    }
  }, [state]);

  return (
    <form action={action}>
      <Card className="w-full space-y-5 rounded-[24px] border border-[#e4e9e6] bg-white p-7 shadow-[0_12px_40px_rgba(0,77,61,0.08)] sm:p-10">
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
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#26332f]"
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#08785f] hover:text-[#066b55] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            className="h-12 rounded-xl border-[#dfe4e1] bg-[#fcfdfc] px-4 text-[15px] placeholder:text-[#aab2ae] shadow-none focus-visible:border-[#08785f] focus-visible:ring-4 focus-visible:ring-[#08785f]/10"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-[#08785f] text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(8,120,95,0.18)] transition-all hover:bg-[#066b55] hover:shadow-[0_8px_20px_rgba(8,120,95,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Logging in..." : "Login"}
        </Button>

        {/* Register */}
        <p className="pt-2 text-center text-sm text-[#7a8782]">
          Don&rsquo;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#08785f] hover:text-[#066b55] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </Card>
    </form>
  );
};

export default LoginForm;