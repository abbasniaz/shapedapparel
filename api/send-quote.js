import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { quote, quoteLink } = req.body || {};

    if (!quote?.email) {
      return res.status(400).json({ error: "Missing customer email" });
    }

    const customerTo = quote.customerEmail || quote.email;

    const itemsHtml = (quote.items || [])
      .map(
        (i) => `
          <tr>
            <td>${i.name}</td>
            <td>${i.size || "-"}</td>
            <td>${i.qty}</td>
            <td>$${Number(i.price).toFixed(2)}</td>
            <td>$${Number(i.lineTotal).toFixed(2)}</td>
          </tr>`
      )
      .join("");

    await resend.emails.send({
      from: "SHAPED <quotes@yourdomain.com>",
      to: [customerTo],
      subject: `Your SHAPED Quote ${quote.ref}`,
      html: `
        <h2>Your SHAPED Quote</h2>
        <p><b>Reference:</b> ${quote.ref}</p>
        <p><b>Quote link:</b> <a href="${quoteLink}">${quoteLink}</a></p>
        <p><b>Subtotal:</b> $${Number(quote.subtotal).toFixed(2)}</p>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead>
            <tr>
              <th>Item</th><th>Size</th><th>Qty</th><th>Unit</th><th>Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><b>Notes:</b> ${quote.notes || "-"}</p>
      `
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send quote" });
  }
}
