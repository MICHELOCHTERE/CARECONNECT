const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

  try {
    await resend.emails.send({
      from: 'Quikcare Contact <noreply@quikcare.co.uk>',
      to: 'hello@quikcare.co.uk',
      reply_to: email,
      subject: subject ? `Contact Form: ${subject}` : `New message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8f5ff;">
          <div style="background:#6C3FC5;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
            <div style="color:white;font-size:22px;font-weight:700;">New Contact Form Message</div>
            <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px;">Quikcare.co.uk</div>
          </div>
          <div style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebff;font-size:12px;color:#9b7fd4;text-transform:uppercase;letter-spacing:0.08em;width:100px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f0ebff;font-size:14px;color:#1a1a2e;">${name}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebff;font-size:12px;color:#9b7fd4;text-transform:uppercase;letter-spacing:0.08em;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0ebff;font-size:14px;color:#1a1a2e;"><a href="mailto:${email}" style="color:#6C3FC5;">${email}</a></td></tr>
              ${subject ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ebff;font-size:12px;color:#9b7fd4;text-transform:uppercase;letter-spacing:0.08em;">Subject</td><td style="padding:8px 0;border-bottom:1px solid #f0ebff;font-size:14px;color:#1a1a2e;">${subject}</td></tr>` : ''}
            </table>
            <div style="font-size:12px;color:#9b7fd4;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Message</div>
            <div style="background:#f8f5ff;border-radius:8px;padding:16px;font-size:14px;color:#1a1a2e;line-height:1.7;white-space:pre-wrap;">${message}</div>
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e8e0f5;font-size:12px;color:#9b7fd4;text-align:center;">
              Reply directly to this email to respond to ${name}
            </div>
          </div>
        </div>
      `,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
