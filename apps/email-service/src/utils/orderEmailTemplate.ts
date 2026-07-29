export interface OrderEmailItem {
  productId?: number;
  name: string;
  quantity: number;
  price: number; // in cents or dollars
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderEmailData {
  orderId?: string;
  email: string;
  amount: number; // in cents or dollars
  status: string;
  products?: OrderEmailItem[];
  createdAt?: string | Date;
}

export function generateOrderEmailHtml(data: OrderEmailData): string {
  const { orderId, amount, products = [], createdAt } = data;

  // Format currency
  const formatPrice = (val: number) => {
    const num = val > 1000 && val % 1 === 0 ? val / 100 : val;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formattedTotal = formatPrice(amount);

  // Format date
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);

  const formattedOrderId = orderId
    ? `#OMF-${orderId.substring(orderId.length - 7).toUpperCase()}`
    : "#OMF-1200343";

  // Build items rows
  const itemRowsHtml =
    products.length > 0
      ? products
          .map((item, idx) => {
            const itemPrice = formatPrice(item.price * item.quantity);
            const specs = [
              item.selectedSize ? `Size: ${item.selectedSize}` : null,
              item.selectedColor ? `Color: ${item.selectedColor}` : null,
            ]
              .filter(Boolean)
              .join(" • ");

            const imgUrl = item.image
              ? item.image.startsWith("http")
                ? item.image
                : `https://raw.githubusercontent.com/induwaragmg/ominify/main/apps/client/public${item.image}`
              : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80";

            return `
        <tr>
          <td style="padding: 16px; ${idx < products.length - 1 ? "border-bottom: 1px solid #f1f5f9;" : ""}">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="70" valign="top">
                  <div style="width: 68px; height: 68px; background-color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9; text-align: center; line-height: 68px;">
                    <img src="${imgUrl}" alt="${item.name}" width="68" height="68" style="width: 68px; height: 68px; object-fit: contain; vertical-align: middle;" />
                  </div>
                </td>
                <td style="padding-left: 16px;" valign="top">
                  <div style="font-size: 15px; font-weight: 700; color: #0f172a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">${item.name}</div>
                  ${
                    specs
                      ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px; font-family: 'Inter', sans-serif;">${specs}</div>`
                      : ""
                  }
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; font-family: 'Inter', sans-serif;">SKU: OMF-PRD-${item.productId || idx + 101}</div>
                </td>
                <td align="right" valign="top">
                  <div style="font-size: 15px; font-weight: 700; color: #0f172a; font-family: 'Inter', sans-serif;">${itemPrice}</div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-family: 'Inter', sans-serif;">Qty: ${item.quantity}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
          })
          .join("")
      : `
      <tr>
        <td style="padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
          Order items standard package (${formattedTotal})
        </td>
      </tr>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Ominify</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9;">

  <!-- Outer Email Container -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center">
        
        <!-- Main Content Card -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 28px; box-shadow: 0 10px 40px rgba(15,23,42,0.06); overflow: hidden; padding: 40px 36px;">
          
          <!-- 1. Header & Logo (Ominify Brand Logo from CID attachment) -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <img src="cid:logo" alt="Ominify" width="160" height="30" style="display: block; width: 160px; height: auto; max-width: 160px; border: 0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. Celebration Icon & Headline -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                Thank you for your order!
              </h1>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5; max-width: 440px;">
                We've received your order and it's being processed. You'll receive another email when your items are shipped.
              </p>
            </td>
          </tr>

          <!-- 3. Order Info Details Bar (3 Columns) -->
          <tr>
            <td style="padding-bottom: 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 18px; border: 1px solid #f1f5f9; padding: 16px 20px;">
                <tr>
                  <!-- Order ID -->
                  <td width="33%" valign="top">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="32" valign="top">
                          <img src="cid:tag" alt="Order ID" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
                        </td>
                        <td style="padding-left: 8px;" valign="top">
                          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">ORDER ID</div>
                          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${formattedOrderId}</div>
                          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${formattedDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Shipping -->
                  <td width="33%" valign="top">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="32" valign="top">
                          <img src="cid:truck" alt="Shipping" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
                        </td>
                        <td style="padding-left: 8px;" valign="top">
                          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">SHIPPING</div>
                          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">Standard Shipping</div>
                          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Delivery in 3–5 days</div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Payment -->
                  <td width="34%" valign="top">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="32" valign="top">
                          <img src="cid:card" alt="Payment" width="28" height="28" style="display: block; width: 28px; height: 28px; border: 0;" />
                        </td>
                        <td style="padding-left: 8px;" valign="top">
                          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">PAYMENT</div>
                          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">Card Payment</div>
                          <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 2px;">Paid Successfully</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 4. Order Items Section -->
          <tr>
            <td style="padding-bottom: 24px;">
              <h2 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
                Order Items (${products.length || 1})
              </h2>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; background-color: #ffffff;">
                ${itemRowsHtml}
              </table>
            </td>
          </tr>

          <!-- 5. Summary & Totals Breakdown -->
          <tr>
            <td style="padding-bottom: 28px;">
              <div style="background-color: #f8fafc; border-radius: 18px; padding: 20px; border: 1px solid #f1f5f9;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Subtotal</td>
                    <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding-bottom: 8px;">${formattedTotal}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Shipping</td>
                    <td align="right" style="font-size: 13px; font-weight: 600; color: #2563eb; padding-bottom: 8px;">Free</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 8px 0;">
                      <div style="border-top: 1px dashed #cbd5e1; width: 100%;"></div>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; font-weight: 800; color: #0f172a; padding-top: 4px;">Total</td>
                    <td align="right" style="font-size: 20px; font-weight: 800; color: #0f172a; padding-top: 4px;">${formattedTotal}</td>
                  </tr>
                </table>
                <div style="height: 4px; background: linear-gradient(90deg, #2563eb, #3b82f6); border-radius: 2px; margin-top: 14px;"></div>
              </div>
            </td>
          </tr>

          <!-- 6. Need Help Support Banner -->
          <tr>
            <td style="padding-bottom: 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f7ff; border-radius: 18px; border: 1px solid #dbeafe; padding: 16px 20px;">
                <tr>
                  <td width="36" valign="middle">
                    <img src="cid:headset" alt="Support" width="32" height="32" style="display: block; width: 32px; height: 32px; border: 0;" />
                  </td>
                  <td valign="middle" style="padding-left: 12px;">
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Need help?</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 1px;">Our support team is here for you 24/7.</div>
                  </td>
                  <td align="right" valign="middle">
                    <a href="https://ominify.com/support" style="display: inline-block; background-color: #ffffff; color: #2563eb; font-size: 12px; font-weight: 700; border: 1px solid #bfdbfe; border-radius: 9999px; padding: 8px 16px; text-decoration: none;">Visit Support Center</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. Trust Badges Row (4 Columns - CID Embedded PNG Icons) -->
          <tr>
            <td style="padding-bottom: 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="25%" align="center" valign="top">
                    <img src="cid:shield" alt="Secure Payment" width="36" height="36" style="display: block; margin: 0 auto 6px auto; width: 36px; height: 36px; border: 0;" />
                    <div style="font-size: 11px; font-weight: 700; color: #0f172a;">Secure Payment</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">100% safe & secure</div>
                  </td>

                  <td width="25%" align="center" valign="top">
                    <img src="cid:truck" alt="Fast Delivery" width="36" height="36" style="display: block; margin: 0 auto 6px auto; width: 36px; height: 36px; border: 0;" />
                    <div style="font-size: 11px; font-weight: 700; color: #0f172a;">Fast Delivery</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Quick & reliable</div>
                  </td>

                  <td width="25%" align="center" valign="top">
                    <img src="cid:return" alt="Easy Returns" width="36" height="36" style="display: block; margin: 0 auto 6px auto; width: 36px; height: 36px; border: 0;" />
                    <div style="font-size: 11px; font-weight: 700; color: #0f172a;">Easy Returns</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Hassle-free returns</div>
                  </td>

                  <td width="25%" align="center" valign="top">
                    <img src="cid:star" alt="Quality Guarantee" width="36" height="36" style="display: block; margin: 0 auto 6px auto; width: 36px; height: 36px; border: 0;" />
                    <div style="font-size: 11px; font-weight: 700; color: #0f172a;">Quality Guarantee</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Premium quality</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 8. Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">
                Stay connected with <strong style="color: #0f172a;">O<span style="color: #2563eb;">minify</span></strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © ${new Date().getFullYear()} Ominify Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
