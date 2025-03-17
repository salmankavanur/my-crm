import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Invoice from "@/models/Invoice";

export async function GET() {
    await dbConnect();

    try {
        const totalCustomers = await Customer.countDocuments();
        const totalInvoices = await Invoice.countDocuments();
        const totalRevenue = await Invoice.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const outstanding = await Invoice.aggregate([
            { $match: { status: { $in: ["unpaid", "overdue"] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        return NextResponse.json({
            totalCustomers,
            totalInvoices,
            totalRevenue: totalRevenue[0]?.total || 0,
            outstanding: outstanding[0]?.total || 0
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
