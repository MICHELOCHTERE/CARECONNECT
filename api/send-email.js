const { Resend } = require('resend');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'hello@quikcare.co.uk';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

const templates = {
  // Email to carer confirming submission
  carerConfirmation: (data) => ({
    from: `Quikcare <${FROM_EMAIL}>`,
    to: data.carerEmail,
    subject: `Application Received — ${data.agencyName}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5ff; padding: 40px 24px;">
        <div style="background: white; border-radius: 16px; padding: 40px; border: 1px solid #e8e0f5;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: #6C3FC5; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; font-family: serif;">Q</div>
            <div style="font-size: 22px; color: #6C3FC5; font-weight: 700; margin-top: 12px;">Quikcare</div>
          </div>
          <div style="background: #e8f5eb; border: 1px solid #a3d9b1; border-radius: 10px; padding: 16px 20px; text-align: center; margin-bottom: 28px;">
            <div style="font-size: 28px; margin-bottom: 8px;">✅</div>
            <div style="color: #1a7a3a; font-weight: 700; font-size: 16px;">Application Received!</div>
          </div>
          <p style="color: #1a1a2e; font-size: 16px; margin-bottom: 16px;">Hi <strong>${data.carerName}</strong>,</p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 16px;">
            Thank you for submitting your application to <strong>${data.agencyName}</strong> through Quikcare. We have received your application and it is now being reviewed.
          </p>
          <div style="background: #f8f5ff; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #9b7fd4; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Application Details</div>
            <div style="color: #1a1a2e; font-size: 14px;"><strong>Applied to:</strong> ${data.agencyName}</div>
            <div style="color: #1a1a2e; font-size: 14px; margin-top: 4px;"><strong>Date:</strong> ${data.appliedAt}</div>
            <div style="color: #1a1a2e; font-size: 14px; margin-top: 4px;"><strong>Status:</strong> Under Review</div>
          </div>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
            The agency will be in touch within 2-5 working days. If you have any questions, please contact <a href="mailto:support@quikcare.co.uk" style="color: #6C3FC5;">support@quikcare.co.uk</a>.
          </p>
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e8e0f5;">
            <div style="color: #9b7fd4; font-size: 12px;">Quikcare Ltd · Company No. 17206901</div>
            <div style="color: #9b7fd4; font-size: 12px; margin-top: 4px;"><a href="https://quikcare.co.uk/privacy" style="color: #9b7fd4;">Privacy Policy</a></div>
          </div>
        </div>
      </div>
    `
  }),

  // Email to agency notifying of new application
  agencyNotification: (data) => ({
    from: `Quikcare <${FROM_EMAIL}>`,
    to: data.agencyEmail,
    subject: `🔔 New Application — ${data.carerName}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5ff; padding: 40px 24px;">
        <div style="background: white; border-radius: 16px; padding: 40px; border: 1px solid #e8e0f5;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: #6C3FC5; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; font-family: serif;">Q</div>
            <div style="font-size: 22px; color: #6C3FC5; font-weight: 700; margin-top: 12px;">Quikcare</div>
          </div>
          <div style="background: #f0ebff; border: 1px solid #c5b3e8; border-radius: 10px; padding: 16px 20px; text-align: center; margin-bottom: 28px;">
            <div style="font-size: 28px; margin-bottom: 8px;">📋</div>
            <div style="color: #6C3FC5; font-weight: 700; font-size: 16px;">New Carer Application Received</div>
          </div>
          <p style="color: #1a1a2e; font-size: 16px; margin-bottom: 16px;">Hi <strong>${data.agencyName}</strong>,</p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
            A new carer application has been submitted through your Quikcare recruitment link.
          </p>
          <div style="background: #f8f5ff; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #9b7fd4; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Applicant Details</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #9b7fd4; font-size: 13px; width: 40%;">Name</td><td style="padding: 6px 0; color: #1a1a2e; font-size: 13px; font-weight: 600;">${data.carerName}</td></tr>
              <tr><td style="padding: 6px 0; color: #9b7fd4; font-size: 13px;">Email</td><td style="padding: 6px 0; color: #1a1a2e; font-size: 13px;">${data.carerEmail}</td></tr>
              <tr><td style="padding: 6px 0; color: #9b7fd4; font-size: 13px;">Phone</td><td style="padding: 6px 0; color: #1a1a2e; font-size: 13px;">${data.carerPhone}</td></tr>
              <tr><td style="padding: 6px 0; color: #9b7fd4; font-size: 13px;">Postcode</td><td style="padding: 6px 0; color: #1a1a2e; font-size: 13px;">${data.carerPostcode}</td></tr>
              <tr><td style="padding: 6px 0; color: #9b7fd4; font-size: 13px;">Applied</td><td style="padding: 6px 0; color: #1a1a2e; font-size: 13px;">${data.appliedAt}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://quikcare.co.uk/agency/dashboard" style="display: inline-block; padding: 14px 32px; background: #6C3FC5; border-radius: 8px; color: white; font-size: 14px; font-weight: 700; text-decoration: none;">View Full Application →</a>
          </div>
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e8e0f5;">
            <div style="color: #9b7fd4; font-size: 12px;">Quikcare Ltd · Company No. 17206901</div>
          </div>
        </div>
      </div>
    `
  }),

  // Email to carer when approved
  carerApproved: (data) => ({
    from: `Quikcare <${FROM_EMAIL}>`,
    to: data.carerEmail,
    subject: `🎉 Application Approved — ${data.agencyName}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5ff; padding: 40px 24px;">
        <div style="background: white; border-radius: 16px; padding: 40px; border: 1px solid #e8e0f5;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: #6C3FC5; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; font-family: serif;">Q</div>
            <div style="font-size: 22px; color: #6C3FC5; font-weight: 700; margin-top: 12px;">Quikcare</div>
          </div>
          <div style="background: #e8f5eb; border: 1px solid #a3d9b1; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 28px;">
            <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
            <div style="color: #1a7a3a; font-weight: 700; font-size: 18px;">Congratulations!</div>
            <div style="color: #1a7a3a; font-size: 14px; margin-top: 4px;">Your application has been approved</div>
          </div>
          <p style="color: #1a1a2e; font-size: 16px; margin-bottom: 16px;">Hi <strong>${data.carerName}</strong>,</p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 16px;">
            Great news! <strong>${data.agencyName}</strong> has approved your application. They will be in touch shortly with your next steps and start date.
          </p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
            Welcome to the team! If you have any questions in the meantime, please contact <a href="mailto:support@quikcare.co.uk" style="color: #6C3FC5;">support@quikcare.co.uk</a>.
          </p>
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e8e0f5;">
            <div style="color: #9b7fd4; font-size: 12px;">Quikcare Ltd · Company No. 17206901</div>
          </div>
        </div>
      </div>
    `
  }),

  // Email to carer when rejected
  carerRejected: (data) => ({
    from: `Quikcare <${FROM_EMAIL}>`,
    to: data.carerEmail,
    subject: `Update on your application — ${data.agencyName}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5ff; padding: 40px 24px;">
        <div style="background: white; border-radius: 16px; padding: 40px; border: 1px solid #e8e0f5;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: #6C3FC5; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: white; font-family: serif;">Q</div>
            <div style="font-size: 22px; color: #6C3FC5; font-weight: 700; margin-top: 12px;">Quikcare</div>
          </div>
          <p style="color: #1a1a2e; font-size: 16px; margin-bottom: 16px;">Hi <strong>${data.carerName}</strong>,</p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 16px;">
            Thank you for taking the time to apply to <strong>${data.agencyName}</strong> through Quikcare.
          </p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 16px;">
            After careful consideration, the agency is unable to move forward with your application at this time. We encourage you to keep your profile updated and apply to other opportunities.
          </p>
          <p style="color: #4a4a6a; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
            We wish you the best in your job search. If you have any questions, please contact <a href="mailto:support@quikcare.co.uk" style="color: #6C3FC5;">support@quikcare.co.uk</a>.
          </p>
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e8e0f5;">
            <div style="color: #9b7fd4; font-size: 12px;">Quikcare Ltd · Company No. 17206901</div>
          </div>
        </div>
      </div>
    `
  }),
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data' });
  }

  const template = templates[type];
  if (!template) {
    return res.status(400).json({ error: `Unknown email type: ${type}` });
  }

  try {
    // For agency notifications, fetch agency email from Firestore server-side
    let emailData;
    if (type === 'agencyNotification') {
      const agencySlug = data.agencySlug;
      if (agencySlug && !data.agencyEmail) {
        try {
          const slugDoc = await db.collection('agencySlugs').doc(agencySlug).get();
          if (slugDoc.exists) {
            const agencyUid = slugDoc.data().uid;
            const agencyDoc = await db.collection('agencies').doc(agencyUid).get();
            if (agencyDoc.exists) {
              data.agencyEmail = agencyDoc.data().email;
              data.agencyName = agencyDoc.data().agencyName || agencySlug;
            }
          }
        } catch (fetchErr) {
          console.error('Failed to fetch agency email:', fetchErr);
        }
      }
      if (!data.agencyEmail) {
        return res.status(400).json({ error: 'Could not find agency email' });
      }
    }
    emailData = template(data);
    const result = await resend.emails.send(emailData);
    return res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
