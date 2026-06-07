import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return Response.json({
      success: true,
      order,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}