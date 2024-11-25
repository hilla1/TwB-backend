// src/controllers/contactController.js
import Contact from '../models/contactModel.js';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';

// Get all contact messages (accessible to admin and blogger)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate({
        path: 'responses.respondedBy',  // Populate the 'respondedBy' field within 'responses'
        select: '-password -__v'  // Exclude sensitive fields like password and __v for security
      })
      .exec();  // Execute the query

    // Check if contacts were found
    if (!contacts || contacts.length === 0) {
      console.log('No contacts found');  // Log information for debugging
      return res.status(404).json({ message: 'No contacts found.' });
    }

    // Return all contact details
    res.status(200).json(contacts);
  } catch (error) {
    // Log the error for detailed troubleshooting
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

// Respond to a contact message (admin/blogger only)
export const respondToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { response:responseMessage } = req.body;

    // Find the contact message by id
    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ message: 'Contact message not found' });

    // Create a new response object
    const newResponse = {
      message: responseMessage,
      respondedBy: req.user.id, // Store who responded
      respondedAt: new Date(), // Timestamp for when the response was made
    };

    // Mark the contact message as read and save the response
    contact.responses.push(newResponse);
    contact.isRead = true;
    contact.respondedBy = req.user.id; // Store who responded
    await contact.save();

    // Set up the email transporter (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: 'TechwithBrands <admin@techwithbrands.com>',
      to: contact.email, // Send to the contact's email address
      subject: `Response to your inquiry: ${contact.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${contact.subject}</title>
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
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td colspan="2" style="padding: 20px;">
                      <p style="color: #333333; font-family: Arial, sans-serif; font-size: 16px;">
                        Dear ${contact.name},
                      </p>
                      <h2 style="color: #333333; font-family: Arial, sans-serif; font-size: 24px; margin: 0 0 10px 0;">${contact.subject}</h2>
                      <p style="color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                        ${responseMessage}
                      </p>
                      <p style="color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                        Should you have any further questions, feel free to reach out to us.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td colspan="2" style="padding: 20px; background-color: #f9f9f9;">
                      <p style="color: #555555; font-family: Arial, sans-serif; font-size: 16px;">
                        Regards,<br>
                        ${req.user.name}<br>
                        TechwithBrands (TwB)
                      </p>
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

    // Send the email
    await transporter.sendMail(mailOptions);

    // Send a success response
    res.status(200).json({ message: 'Response added and email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error responding to contact message', error });
  }
};

// Mark a contact message as read (admin/blogger only)
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ message: 'Contact message not found' });

    contact.isRead = true;
    await contact.save();

    res.status(200).json({ message: 'Contact message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking contact message as read', error });
  }
};

// Delete a contact message (admin/blogger only)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return res.status(404).json({ message: 'Contact message not found' });

    res.status(200).json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact message', error });
  }
};

// Create a new contact message (Public Route)
export const createContact = async (req, res) => {
  // Handle validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return all error messages
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }

  try {
    const { name, phone, email, message } = req.body;

    // Check if a contact with the provided email already exists
    let existingContact = await Contact.findOne({ email });

    if (existingContact) {
      // If the contact exists, add the new message to the existing contact's messages
      existingContact.messages.push({ content: message });
      existingContact.isRead = false; // Mark as unread
      const updatedContact = await existingContact.save();

      return res.status(200).json({
        message: 'Your message has been added successfully to the existing contact.',
        status: 200,
        contact: updatedContact,
      });
    }

    // Create a new contact message
    const newContact = new Contact({
      name,
      phone,
      email,
      messages: [{ content: message }], // Store the message in the messages array
      isRead: false, // Mark as unread for new contact
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      message: 'Your message has been received successfully.',
      status: 200,
      contact: savedContact,
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Internal server error.', error });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the contact message by ID and populate 'respondedBy' within 'responses'
    const contact = await Contact.findById(id)
      .populate({
        path: 'responses.respondedBy',  // Properly populate the nested field
        select: 'email name avatar'  // Fetch email, name, and avatar fields from the User model
      });

    // If the contact message doesn't exist, return a 404 error
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Create a clean response object without sensitive information
    const cleanContact = {
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      avatar: contact.avatar, // Include the avatar field for the contact
      messages: contact.messages || [],  // Ensure 'messages' is always an array
      responses: (contact.responses || []).map(response => ({
        _id: response._id,
        message: response.message,
        respondedAt: response.respondedAt,
        respondedBy: {
          _id: response.respondedBy._id,
          name: response.respondedBy.name,
          email: response.respondedBy.email,
          avatar: response.respondedBy.avatar  // Include avatar for the responder
        }
      })),
      // Add any other fields that you want to expose
    };

    // Return the clean contact message data
    res.status(200).json(cleanContact);
  } catch (error) {
    console.error('Error fetching contact message:', error);  // Log error for debugging
    res.status(500).json({ message: 'Error fetching contact message', error: error.message });
  }
};

