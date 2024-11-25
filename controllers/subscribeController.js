import nodemailer from 'nodemailer';
import Subscribe from '../models/subscribeModel.js';

// Get all subscriptions (admin only)
export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscribe.find();
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions', error });
  }
};

// Add a new subscription (public or admin)
export const addSubscription = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    let subscription = await Subscribe.findOne({ email });

    // Set up the email transporter (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // If email exists and is unsubscribed, toggle subscribed to true and generate a new token
    if (subscription && !subscription.subscribed) {
      subscription.subscribed = true;
      await subscription.generateUnsubscribeToken();
      await subscription.save();

      // Send re-subscription confirmation email with new unsubscribe button
      const unsubscribeLink = `${req.protocol}://${req.get('host')}/subscribe/unsubscribe/${subscription.unsubscribeToken}`;
      const viteWebLink = process.env.VITE_CLIENT_URL; // Vite client web link

      const mailOptions = {
        from: 'TechwithBrands <admin@techwithbrands.com>',
        to: email,
        subject: 'Welcome Back to TechwithBrands!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome Back to TechwithBrands!</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td colspan="2" style="padding: 20px; background-color: #ffffff;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <!-- Logo Cell -->
                            <td align="left" style="padding: 0;">
                              <img src="https://res.cloudinary.com/df2gqucru/image/upload/v1728541550/gojcnjh6frevppeumfxs.png" alt="TechwithBrands Logo" style="max-width: 200px; height: auto;">
                            </td>
                            <!-- Unsubscribe Cell -->
                            <td align="right" style="padding: 0;">
                              <a href="${unsubscribeLink}" 
                                 style="color: #DC143C; text-decoration: none; font-size: 14px; font-family: Arial, sans-serif;">
                                Unsubscribe
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td colspan="2" style="padding: 20px;">
                        <h2 style="color: #333333; font-family: Arial, sans-serif; font-size: 24px; margin: 0 0 10px 0;">Welcome back to TechwithBrands (TwB)!</h2>
                        <p style="color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                          We're excited to have you back. You have successfully re-subscribed to receive the latest updates on our tech and brand solutions.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td colspan="2" style="padding: 20px; background-color: #f9f9f9;">
                        <p style="font-size: 12px; color: #999999; font-family: Arial, sans-serif; margin: 0;">
                          TechwithBrands (TwB) | Providing Innovative Tech and Branding Solutions<br>
                          <strong>Location:</strong> Nairobi, Kenya | <strong>Phone:</strong> +254791472688 | <strong>Email:</strong> <a href="mailto:admin@techwithbrands.com" style="color: #007BFF; text-decoration: none;">admin@techwithbrands.com</a><br>
                          <strong>Office Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM
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
      };

      await transporter.sendMail(mailOptions); // Sending the email

      return res.status(200).json({ message: 'Email re-subscribed successfully and confirmation email sent.' });
    }

    // If email is already subscribed, return a message
    if (subscription) {
      return res.status(400).json({ message: 'Email is already subscribed.' });
    }

    // Create a new subscription
    subscription = new Subscribe({ email });
    await subscription.generateUnsubscribeToken();
    await subscription.save();

    // Send subscription confirmation email
    const unsubscribeLinkNew = `${req.protocol}://${req.get('host')}/subscribe/unsubscribe/${subscription.unsubscribeToken}`;
    const viteWebLinkNew = process.env.VITE_CLIENT_URL; // Vite client web link

    const mailOptionsNew = {
      from: 'TechwithBrands <admin@techwithbrands.com>',
      to: email,
      subject: 'Welcome to TechwithBrands!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TechwithBrands!</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td colspan="2" style="padding: 20px; background-color: #ffffff;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <!-- Logo Cell -->
                          <td align="left" style="padding: 0;">
                            <img src="https://res.cloudinary.com/df2gqucru/image/upload/v1728541550/gojcnjh6frevppeumfxs.png" alt="TechwithBrands Logo" style="max-width: 200px; height: auto;">
                          </td>
                          <!-- Unsubscribe Cell -->
                          <td align="right" style="padding: 0;">
                            <a href="${unsubscribeLinkNew}" 
                               style="color: #DC143C; text-decoration: none; font-size: 14px; font-family: Arial, sans-serif;">
                              Unsubscribe
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td colspan="2" style="padding: 20px;">
                      <h2 style="color: #333333; font-family: Arial, sans-serif; font-size: 24px; margin: 0 0 10px 0;">Thank you for subscribing to TechwithBrands (TwB)!</h2>
                      <p style="color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                        We appreciate your interest in our tech and brand solutions. You'll now receive updates about our latest innovations.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                    <tr>
                      <td colspan="2" style="padding: 20px; background-color: #f9f9f9;">
                        <p style="font-size: 12px; color: #999999; font-family: Arial, sans-serif; margin: 0;">
                          TechwithBrands (TwB) | Providing Innovative Tech and Branding Solutions<br>
                          <strong>Location:</strong> Nairobi, Kenya | <strong>Phone:</strong> +254791472688 | <strong>Email:</strong> <a href="mailto:admin@techwithbrands.com" style="color: #007BFF; text-decoration: none;">admin@techwithbrands.com</a><br>
                          <strong>Office Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM
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
    };

    await transporter.sendMail(mailOptionsNew); // Sending the new subscription email

    return res.status(201).json({ message: 'Subscription added successfully and confirmation email sent.' });
  } catch (error) {
    console.error('Error adding subscription:', error);
    return res.status(500).json({ message: 'Error adding subscription', error: error.message });
  }
};
// Update an existing subscription (admin only)
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const subscription = await Subscribe.findById(id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    // Validate new email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    subscription.email = email || subscription.email;
    await subscription.save();
    res.status(200).json({ message: 'Subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription', error });
  }
};

// Delete a subscription (admin only)
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscribe.findByIdAndDelete(id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription', error });
  }
};

// Unsubscribe a user (via button in the email)
export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;
    const subscription = await Subscribe.findOne({ unsubscribeToken: token });
    if (!subscription) {
      return res.redirect(`${process.env.VITE_CLIENT_URL}/unsubscribe?status=invalid`);
    }
    await subscription.unsubscribe();
    res.redirect(`${process.env.VITE_CLIENT_URL}/unsubscribe?status=success`);
  } catch (error) {
    res.redirect(`${process.env.VITE_CLIENT_URL}/unsubscribe?status=error`);
  }
};

// Send mass subscription email (admin/consultant only)
export const sendMassSubscriptionEmail = async (req, res) => {
  try {
    const { subject, message, mediaUrls } = req.body; // mediaUrls for images and other files
    const sender = req.user.role; // Extract role from the authenticated user (admin or consultant)

    if (!['admin', 'consultant'].includes(sender)) {
      return res.status(403).json({ message: 'Unauthorized: Only admins or consultants can send mass emails' });
    }

    // Get all subscribers
    const subscriptions = await Subscribe.find();

    if (subscriptions.length === 0) {
      return res.status(400).json({ message: 'No subscribers found' });
    }

    // Set up the email transporter (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Function to generate media URLs links
    const generateMediaLinks = (urls) => {
      if (!urls || urls.length === 0) return '';
      return urls.map(url => `
        <tr>
          <td style="padding: 5px 0;">
            <a href="${url}" style="color: #007BFF; text-decoration: none;">Download File</a>
          </td>
        </tr>
      `).join('');
    };

    // Send an email to each subscriber with an unsubscribe button as text
    const emailPromises = subscriptions.map((subscription) =>
      transporter.sendMail({
        from: `TechwithBrands <${process.env.EMAIL_USER}>`, // Sender name and email
        to: subscription.email, // Recipient email
        subject, // Email subject
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td colspan="2" style="padding: 20px; background-color: #ffffff;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <!-- Logo Cell -->
                            <td align="left" style="padding: 0;">
                              <img src="https://res.cloudinary.com/df2gqucru/image/upload/v1728541550/gojcnjh6frevppeumfxs.png" alt="TechwithBrands Logo" style="max-width: 200px; height: auto;">
                            </td>
                            <!-- Unsubscribe Cell -->
                            <td align="right" style="padding: 0;">
                              <a href="${req.protocol}://${req.get('host')}/subscribe/unsubscribe/${subscription.unsubscribeToken}" 
                                 style="color: #DC143C; text-decoration: none; font-size: 14px; font-family: Arial, sans-serif;">
                                Unsubscribe
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td colspan="2" style="padding: 20px;">
                        <h2 style="color: #333333; font-family: Arial, sans-serif; font-size: 24px; margin: 0 0 10px 0;">${subject}</h2>
                        <p style="color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                          ${message}
                        </p>
                        ${mediaUrls && mediaUrls.length > 0 ? `
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                            ${generateMediaLinks(mediaUrls)}
                          </table>
                        ` : ''}
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td colspan="2" style="padding: 20px; background-color: #f9f9f9;">
                        <p style="font-size: 12px; color: #999999; font-family: Arial, sans-serif; margin: 0;">
                          TechwithBrands (TwB) | Providing Innovative Tech and Branding Solutions<br>
                          <strong>Location:</strong> Nairobi, Kenya | <strong>Phone:</strong> +254791472688 | <strong>Email:</strong> <a href="mailto:admin@techwithbrands.com" style="color: #007BFF; text-decoration: none;">admin@techwithbrands.com</a><br>
                          <strong>Office Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM
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
      })
    );

    await Promise.all(emailPromises); // Ensure all emails are sent

    res.status(200).json({ message: 'Emails sent successfully to all subscribers' });
  } catch (error) {
    console.error('Error sending mass subscription emails:', error);
    res.status(500).json({ message: 'Error sending mass subscription emails', error });
  }
};


