const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refereeName, refereeEmail, carerName, agencyName, referenceLink } = req.body;

  if (!refereeEmail || !carerName || !referenceLink) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: 'Quikcare <noreply@quikcare.co.uk>',
      to: refereeEmail,
      subject: `Reference Request for ${carerName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f8f5ff;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

                  <!-- Header -->
                  <tr>
                    <td style="background:#6C3FC5;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
                      <div style="width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:white;font-family:Georgia,serif;margin-bottom:12px;">Q</div>
                      <div style="color:white;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Quikcare</div>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="background:#ffffff;padding:36px 32px;">
                      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">Professional Reference Request</p>
                      <p style="margin:0 0 24px;font-size:14px;color:#9b7fd4;">From ${agencyName}</p>

                      <p style="margin:0 0 20px;font-size:15px;color:#1a1a2e;line-height:1.7;">
                        Dear ${refereeName || 'Referee'},
                      </p>
                      <p style="margin:0 0 20px;font-size:15px;color:#1a1a2e;line-height:1.7;">
                        <strong>${agencyName}</strong> is currently processing an application from <strong>${carerName}</strong>, who has listed you as a professional referee.
                      </p>
                      <p style="margin:0 0 28px;font-size:15px;color:#1a1a2e;line-height:1.7;">
                        We would be grateful if you could take a few minutes to complete a short reference form by clicking the button below. All information provided will be kept strictly confidential.
                      </p>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding-bottom:28px;">
                            <a href="${referenceLink}"
                              style="display:inline-block;background:#6C3FC5;color:white;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;">
                              Complete Reference →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Link fallback -->
                      <div style="background:#f8f5ff;border:1px solid #e8e0f5;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
                        <p style="margin:0 0 6px;font-size:11px;color:#9b7fd4;text-transform:uppercase;letter-spacing:0.08em;">Or copy this link into your browser</p>
                        <p style="margin:0;font-size:12px;color:#6C3FC5;word-break:break-all;">${referenceLink}</p>
                      </div>

                      <p style="margin:0;font-size:13px;color:#9b7fd4;line-height:1.7;">
                        If you were not expecting this email or do not know ${carerName}, please ignore it. No action is required.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f0ebff;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#9b7fd4;">
                        Quikcare · quikcare.co.uk<br>
                        This email was sent on behalf of ${agencyName}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
