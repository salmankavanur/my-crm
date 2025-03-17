import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; 

export async function verifyAdmin(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const decoded: any = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== "admin") return null;

    return decoded;
  } catch (error) {
    return null;
  }
}
