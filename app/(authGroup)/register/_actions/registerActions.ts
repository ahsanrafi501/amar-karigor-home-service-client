"use server";

import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type RegisterState = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        name: string;
        email: string;
    };
};

export const registerAction = async (
    prevState: RegisterState,
    formData: FormData
) => {

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    const payload = {
        name,
        email,
        password
    };

    // Register
    const res = await fetch(
        `${process.env.BACKEND_API_URL}/api/user/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    const result = await res.json();

    // Registration failed
    if (!result.success) {
        return result;
    }

    // Automatically login after registration
    const loginRes = await fetch(
        `${process.env.BACKEND_API_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const loginResult = await loginRes.json();

    if (!loginResult.success) {
        return {
            success: false,
            statusCode: loginResult.statusCode,
            message: "Registration successful, but automatic login failed",
        };
    }

    // Set cookies
    const cookieStore = await cookies();

    cookieStore.set(
        "accessToken",
        loginResult.data.accessToken,
        {
            httpOnly: true,
            maxAge: 60 * 60 * 24,
            sameSite: "lax",
        }
    );

    cookieStore.set(
        "refreshToken",
        loginResult.data.refreshToken,
        {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax",
        }
    );

    // Decode access token
    const decodedToken = jwt.decode(
        loginResult.data.accessToken
    ) as JwtPayload;

    // Redirect based on role
    if (decodedToken.role === "USER") {
        redirect("/");
    }

    if (decodedToken.role === "ADMIN") {
        redirect("/admin-dashboard");
    }

    if (decodedToken.role === "TECHNICIAN") {
        redirect("/technician-dashboard");
    }

    redirect("/");
};