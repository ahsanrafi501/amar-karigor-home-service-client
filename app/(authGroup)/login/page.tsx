import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";

import { Button } from "@/components/ui/button";
import LoginForm from "@/app/(authGroup)/login/_components/passowrd-input";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f5f6f5] p-4 md:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-360 overflow-hidden bg-white">
        {/* Left Side */}
        <section className="relative hidden w-[43%] overflow-hidden bg-[#004d3d] px-14 py-12 text-white lg:flex lg:flex-col">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-12 top-12 opacity-[0.07]">
            <House size={270} strokeWidth={1.2} />
          </div>

          {/* Dashed lines */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-20">
            <div className="border-t border-dashed border-[#42b99d]" />
            <div className="mt-12 border-t border-dashed border-[#42b99d]" />
            <div className="mt-12 border-t border-dashed border-[#f7b733]" />
            <div className="mt-12 border-t border-dashed border-[#42b99d]" />
            <div className="mt-12 border-t border-dashed border-[#42b99d]" />
            <div className="mt-12 border-t border-dashed border-[#f7b733]" />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white">
              <div className="relative">
                <House
                  size={25}
                  strokeWidth={2.2}
                  className="text-[#08785f]"
                />

                <span className="absolute left-2.25 top-2 size-2 rounded-full bg-[#f5a623]" />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Amar <span className="text-[#70c7b0]">Karigor</span>
              </h1>

              <p className="text-xs text-[#a8d8cd]">আমার কারিগর</p>
            </div>
          </div>

          {/* Hero */}
          <div className="relative z-10 mt-auto mb-10">
            <h2 className="max-w-125 text-4xl font-bold leading-[1.2] tracking-tight xl:text-[42px]">
              বিশ্বস্ত কারিগর,
              <br />
              হাতের মুঠোয়।
            </h2>

            <p className="mt-5 max-w-125 text-lg leading-7 text-[#b7ddd4]">
              Book verified professionals for repairs, cleaning and
              maintenance — and track every job.
            </p>

            {/* Stats */}
            <div className="mt-9 flex gap-10 xl:gap-12">
              <div>
                <p className="text-[32px] font-bold leading-none">10K+</p>

                <p className="mt-1 text-xs text-[#83bdb0]">
                  Services completed
                </p>
              </div>

              <div>
                <p className="text-[32px] font-bold leading-none">2K+</p>

                <p className="mt-1 text-xs text-[#83bdb0]">
                  Trusted Karigors
                </p>
              </div>

              <div>
                <p className="text-[32px] font-bold leading-none">4.8/5</p>

                <p className="mt-1 text-xs text-[#83bdb0]">
                  Average rating
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative z-10 rounded-2xl bg-[#075a48] px-6 py-5">
            <div className="mb-3 flex gap-1 text-[#ffb229]">
              {"★★★★★".split("").map((star, index) => (
                <span key={index}>{star}</span>
              ))}
            </div>

            <p className="text-[15px] leading-6 text-[#d4ebe6]">
              “Booked an electrician at 9 PM, he came the next morning at 10.
              Clear price, no bargaining. This is how it should be.”
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#f0eaff] text-[11px] font-medium text-[#6b4db8]">
                AC
              </div>

              <div>
                <p className="text-sm font-semibold">Arif Chowdhury</p>

                <p className="text-xs text-[#8bc4b7]">
                  Customer · Mohammadpur
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side */}
        <section className="flex flex-1 items-center justify-center bg-[#f4f6f4] px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-125 rounded-[24px] border border-[#e4e9e6] bg-white px-7 py-8 shadow-[0_12px_40px_rgba(0,77,61,0.08)] sm:px-10 sm:py-10">
            {/* Back */}
            <div className="mb-9">
              <Button
            
                variant="ghost"
                className="h-auto gap-2 px-0 text-sm font-medium text-[#65736e] hover:bg-transparent hover:text-[#08785f]"
              >
                <Link href="/">
                  <ArrowLeft className="size-4" />
                  Back to home
                </Link>
              </Button>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-[32px] font-bold leading-tight tracking-[-0.02em] text-[#17231f] sm:text-[36px]">
                Welcome back
              </h2>

              <p className="mt-2 max-w-97.5 text-[15px] leading-6 text-[#7a8782] sm:text-base">
                Log in to book trusted services, manage your jobs, and stay
                updated.
              </p>
            </div>

            {/* Divider */}
            <div className="mb-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#e8ece9]" />

              <span className="whitespace-nowrap text-xs font-medium text-[#9aa49f]">
                or continue with email
              </span>

              <div className="h-px flex-1 bg-[#e8ece9]" />
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Footer */}
            <p className="mt-6 text-center text-[11px] leading-5 text-[#a0aaa6]">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="text-[#7e8b86] hover:text-[#08785f]"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#7e8b86] hover:text-[#08785f]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}