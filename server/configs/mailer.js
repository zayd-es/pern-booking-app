// by claude: all transactional emails in one place (Resend).
// Note: with the default "onboarding@resend.dev" sender, Resend only delivers to the email of the
// Resend account owner. To email real guests, verify a domain in Resend and set MAIL_FROM,
// for example MAIL_FROM="Zayd <bookings@yourdomain.com>".
import resend from "./resend.js";

const FROM = process.env.MAIL_FROM || "Zayd <onboarding@resend.dev>";
const CURRENCY = process.env.CURRENCY || "$";

// user text (names, hotel names) goes into HTML, so it must be escaped
export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// never throws: a failed email must not break a booking or a payment
export const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    console.error("sendEmail: missing recipient");
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    });
    if (error) console.error("Resend error:", error);
  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
};

const layout = (title, intro, rows, footer = "") => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
    <h2 style="margin:0 0 4px;font-size:22px">${escapeHtml(title)}</h2>
    <p style="margin:0 0 20px;color:#4b5563">${intro}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:8px 0;border-top:1px solid #e5e7eb;color:#6b7280;width:38%">${escapeHtml(label)}</td>
          <td style="padding:8px 0;border-top:1px solid #e5e7eb;font-weight:600">${escapeHtml(value)}</td>
        </tr>`,
        )
        .join("")}
    </table>
    ${footer ? `<p style="margin:20px 0 0;color:#4b5563">${footer}</p>` : ""}
    <p style="margin:28px 0 0;font-size:12px;color:#9ca3af">Zayd - hotels and riads in Morocco</p>
  </div>`;

const fmt = (date) => new Date(date).toDateString();

const bookingRows = (booking) => [
  ["Booking ID", booking.id],
  ["Hotel", booking.hotel.name],
  ["Room", booking.room.roomType],
  ["Address", `${booking.hotel.address}, ${booking.hotel.city}`],
  ["Check-in", fmt(booking.checkInDate)],
  ["Check-out", fmt(booking.checkOutDate)],
  ["Guests", booking.guests],
  ["Total", `${CURRENCY}${booking.totalPrice}`],
];

// booking created, waiting for the payment
export const bookingReceivedEmail = (booking, guest) => ({
  to: guest.email,
  subject: "We received your booking - complete your payment",
  html: layout(
    "Booking received",
    `Hi ${escapeHtml(guest.username || "there")}, your booking is saved. Please complete the payment from <b>My Bookings</b> to confirm it.`,
    bookingRows(booking),
  ),
});

// payment done -> guest
export const bookingConfirmedEmail = (booking, guest) => ({
  to: guest.email,
  subject: "Your booking is confirmed",
  html: layout(
    "Booking confirmed",
    `Hi ${escapeHtml(guest.username || "there")}, your payment was received and your stay is confirmed. We look forward to welcoming you!`,
    bookingRows(booking),
    "Need to change something? You can cancel from <b>My Bookings</b> up to 48 hours before check-in for a full refund.",
  ),
});

// payment done -> hotel owner
export const newBookingOwnerEmail = (booking, guest, owner) => ({
  to: owner.email,
  subject: `New booking at ${booking.hotel.name}`,
  html: layout(
    "New paid booking",
    `Hi ${escapeHtml(owner.username || "there")}, you have a new confirmed booking.`,
    [["Guest", guest.username || guest.email], ...bookingRows(booking)],
  ),
});

// cancelled -> guest
export const bookingCancelledEmail = (booking, guest, { refunded, byOwner }) => ({
  to: guest.email,
  subject: "Your booking was cancelled",
  html: layout(
    "Booking cancelled",
    `Hi ${escapeHtml(guest.username || "there")}, your booking was cancelled${byOwner ? " by the hotel" : ""}.`,
    bookingRows(booking),
    refunded
      ? "Your payment was refunded. It can take 5-10 business days to appear on your card."
      : "",
  ),
});

// cancelled by the guest -> hotel owner
export const bookingCancelledOwnerEmail = (booking, guest, owner) => ({
  to: owner.email,
  subject: `Booking cancelled at ${booking.hotel.name}`,
  html: layout(
    "Booking cancelled by the guest",
    `Hi ${escapeHtml(owner.username || "there")}, a guest cancelled their booking. The room is available again for these dates.`,
    [["Guest", guest.username || guest.email], ...bookingRows(booking)],
  ),
});
