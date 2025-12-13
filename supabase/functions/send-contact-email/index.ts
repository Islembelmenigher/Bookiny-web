import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactEmailRequest = await req.json();

    // Send notification to admin
    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BookEase Contact <onboarding@resend.dev>",
        to: ["belmenigherislem@gmail.com"],
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1F3A63; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #1F3A63; }
              .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e0e0e0; }
              .message-box { white-space: pre-wrap; }
              .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${name} (${email})</div>
                </div>
                ${phone ? `
                <div class="field">
                  <div class="label">Phone:</div>
                  <div class="value">${phone}</div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value message-box">${message}</div>
                </div>
              </div>
              <div class="footer">
                This message was sent via the BookEase contact form.
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!adminEmailRes.ok) {
      const errorData = await adminEmailRes.text();
      throw new Error(`Failed to send admin email: ${errorData}`);
    }

    console.log("Admin email sent successfully");

    // Send confirmation to user
    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BookEase <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message - BookEase",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1F3A63; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
              .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You for Contacting Us!</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to BookEase. We have received your message and will get back to you as soon as possible.</p>
                <p><strong>Your message summary:</strong></p>
                <p><em>Subject: ${subject}</em></p>
                <p>We typically respond within 24-48 hours during business days.</p>
                <p>Best regards,<br>The BookEase Team</p>
              </div>
              <div class="footer">
                © 2024 BookEase. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!userEmailRes.ok) {
      console.error("Failed to send user confirmation email");
    } else {
      console.log("User confirmation email sent successfully");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

// To be edited after buying a domain nmae for the website then we can use it to creat some emails with resend 
// then we can connect it using API key from resend into this page 