const razorpay = require('./razorpay_config');
const crypto = require("crypto");

const Subscription = require("../models/subscription");
const Payment = require("../models/payment_schema");
const User = require("../models/user");

// 🧾 CREATE ORDER
const Create_Order = async (req, res, next) => {
    try {
        const { plan } = req.body;

        const plans = {
            STARTUP: 1 * 100, // ₹200
            PRO: 1 * 100      // ₹350
        };

        if (!plans[plan]) {
            return res.status(400).json({ error: "Invalid plan" });
        }

        const amount = plans[plan];

        // 🔹 Create order in Razorpay
        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.userid.toString(),
                plan,
                forsite: "EMS",
            }
        });

        // console.log("order created", order)

        // 🔹 Create subscription (PENDING)
        const subscription = await Subscription.create({
            userId: req.userid,
            plan,
            amount,
            orderId: order.id,
            status: "PENDING"
        });

        // 🔹 Create payment record
        await Payment.create({
            userId: req.user._id,
            subscriptionId: subscription._id,
            orderId: order.id,
            amount,
            status: "CREATED"
        });

        res.json(order);

    } catch (err) {
        console.error("❌ CREATE ORDER ERROR:", err);
        res.status(500).json({ error: "Order creation failed" });
    }
};


// 🔐 VERIFY PAYMENT (FRONTEND CALLBACK)
const verify_payment = async (req, res, next) => {

    console.log("user callback_verify paymnet",req.body)
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false });
        }
        console.log("razorpay signature matched")

        // 🔹 Find subscription
        const subscription = await Subscription.findOne({ orderId: razorpay_order_id });

        if (!subscription) {
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }

        // 🔹 Activate subscription
        const startDate = new Date();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        subscription.status = "ACTIVE";
        subscription.paymentId = razorpay_payment_id;
        subscription.startDate = startDate;
        subscription.endDate = endDate;

        await subscription.save();

        // 🔹 Update payment
        await Payment.updateOne(
            { orderId: razorpay_order_id },
            {
                paymentId: razorpay_payment_id,
                status: "SUCCESS"
            }
        );

        // 🔹 Update user
        await User.updateOne(
            { _id: subscription.userId },
            {
                "subscription.plan": subscription.plan,
                "subscription.isActive": true,
                "subscription.expiresAt": endDate
            }
        );

        res.json({ success: true });

    } catch (err) {
        console.error("❌ VERIFY ERROR:", err);
        res.status(500).json({ success: false });
    }
};


// 📡 WEBHOOK (FINAL SOURCE OF TRUTH)
const webhook = async (req, res, next) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        const signature = req.headers["x-razorpay-signature"];

        console.log("razorpay webhook aaya", signature)

        const generatedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        if (generatedSignature !== signature) {
            console.log("❌ Invalid webhook signature");
            return res.status(400).send("Invalid signature");
        }
        console.log("razorpay signature matched")

        const body = JSON.parse(req.body.toString());
        const event = body.event;

        console.log("📩 WEBHOOK EVENT:", event);

        // ✅ PAYMENT SUCCESS
        if (event === "payment.captured") {
            const payment = body.payload.payment.entity;

            console.log("✅ Payment Captured:", payment.id);

            const subscription = await Subscription.findOne({ orderId: payment.order_id });

            if (subscription && subscription.status !== "ACTIVE") {

                const startDate = new Date();
                const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                subscription.status = "ACTIVE";
                subscription.paymentId = payment.id;
                subscription.startDate = startDate;
                subscription.endDate = endDate;

                await subscription.save();

                await Payment.updateOne(
                    { orderId: payment.order_id },
                    {
                        paymentId: payment.id,
                        status: "SUCCESS"
                    }
                );

                await User.updateOne(
                    { _id: subscription.userId },
                    {
                        "subscription.plan": subscription.plan,
                        "subscription.isActive": true,
                        "subscription.expiresAt": endDate
                    }
                );
            }
        }

        // ❌ PAYMENT FAILED
        if (event === "payment.failed") {
            const payment = body.payload.payment.entity;

            console.log("❌ Payment Failed:", payment.id);

            await Subscription.updateOne(
                { orderId: payment.order_id },
                { status: "FAILED" }
            );

            await Payment.updateOne(
                { orderId: payment.order_id },
                { status: "FAILED" }
            );
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(500).send("Server Error");
    }
};


module.exports = { Create_Order, verify_payment, webhook };