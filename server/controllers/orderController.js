import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from "../models/User.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Calculate total amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });

      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // Add tax

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    const stripInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Stripe Webhooks to verify payments action : /stripe
export const stripeWebhooks = async (request,respone)=>{
  //Stripe Gateway Initialize
    const stripInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
      event =stripInstance.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      respone.status(400).send(`Webhook Error: ${error.message}`)
    }
    //Handle the event
    switch(event.type){
      case "payment_intent.succeeded":{
        const paymentIntent = event.data.object;
         const paymentIntentId = paymentIntent.id;

         //getting session metadata
         const session = await stripInstance.checkout.session.list({
          payment_intent:paymentIntentId,
         });
         const {orderId,userId} = session.data[0].metadata;
         //Mark Payment as Paid
         await Order.findByIdAndUpdate(orderId,{isPaid:true})
         //clear the cart data
         await User.findByIdAndUpdate(userId,{cartItems:{}})
         break;
      }
      case "payment_intent.succeeded":{
        const paymentIntent = event.data.object;
         const paymentIntentId = paymentIntent.id;

         //getting session metadata
         const session = await stripInstance.checkout.session.list({
          payment_intent:paymentIntentId,
         });
         const {orderId} = session.data[0].metadata;
         await Order.findByIdAndDelete(orderId);
         break;
      }
      default:
        console.error(`Unhandled event type ${event.type}`)
        break;
    }
    respone.json({received: true})

}

// Get Orders by User ID: /api/order/user
export const getUserOrder = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Orders (Admin/Seller): /api/order/seller
export const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
