import Stripe from "stripe";
import prisma from "../configs/prisma.js";
import {
  sendEmail,
  bookingConfirmedEmail,
  newBookingOwnerEmail,
} from "../configs/mailer.js"; // by claude

// by claude: confirm a booking after payment (skips cancelled/already confirmed ones)
const confirmBooking = async (bookingId, paymentIntentId) => {
  if (!bookingId) {
    console.error("Stripe webhook: bookingId missing in metadata");
    return;
  }
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    console.error(`Stripe webhook: booking ${bookingId} not found`);
    return;
  }
  if (booking.status === "CANCELLED") {
    // paid but cancelled meanwhile: needs a manual refund from the Stripe dashboard
    console.warn(`Stripe webhook: booking ${bookingId} is CANCELLED but was paid, refund needed`);
    return;
  }
  if (booking.status === "CONFIRMED") return;

  await prisma.booking.update({
    where: { id: bookingId },
    // by claude: keep the PaymentIntent id so the booking can be refunded later
    data: {
      status: "CONFIRMED",
      paymentMethod: "Stripe",
      paymentIntentId: paymentIntentId || null,
    },
  });

  // by claude: emails (guest + hotel owner). They never throw, a mail problem can't fail the webhook.
  const full = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, room: true, hotel: { include: { owner: true } } },
  });
  if (full) {
    await Promise.all([
      sendEmail(bookingConfirmedEmail(full, full.user)),
      sendEmail(newBookingOwnerEmail(full, full.user, full.hotel.owner)),
    ]);
  }
};

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // by claude: new event, bookingId comes directly in the metadata
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        await confirmBooking(
          session.metadata?.bookingId,
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        );
      }
    }
    // by claude: old event, kept so payments still work until it's removed in the Stripe dashboard
    else if (event.type === "payment_intent.succeeded") {
      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: event.data.object.id,
      });
      await confirmBooking(
        sessions.data[0]?.metadata?.bookingId,
        event.data.object.id,
      );
    } else {
      console.log(`Unhandled event type :`, event.type);
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return response.status(500).json({ received: false });
  }

  response.json({ received: true });
};
