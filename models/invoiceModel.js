import mongoose from 'mongoose';
import Receipt from './receiptModel.js'; // Import the Receipt model

const { Schema } = mongoose;

// Schema for invoice
const invoiceSchema = new Schema({
  invoiceId: { type: String, required: true, unique: true }, // Unique invoice ID
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, // Reference to the project
  amount: { type: Number, required: true }, // Invoice amount
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }, // Payment status
  transactionId: { type: String, default: null }, // Transaction ID for payment, null on creation
  paymentMethod: { type: String, default: null }, // Payment method used, null on creation
  paymentDate: { type: Date, default: null }, // Date of payment, null on creation
  createdAt: { type: Date, default: Date.now }, // Invoice creation date
  updatedAt: { type: Date, default: Date.now }, // Invoice last updated date
});

// Method to generate an invoice when admin sets the amount
invoiceSchema.statics.generateInvoice = async function (projectId, amount) {
  if (amount <= 0) {
    throw new Error('Invoice amount must be greater than zero.');
  }

  const invoiceId = `INV-${projectId}-${Date.now()}`; // Generate a unique invoice ID

  const invoice = new this({ // Create a new invoice instance
    invoiceId,
    projectId,
    amount,
  });

  await invoice.save(); // Save the invoice to the database
  return invoice; // Return the created invoice
};

// Method to update payment details after receiving payment
invoiceSchema.methods.updatePaymentDetails = async function (transactionId, paymentMethod) {
  this.transactionId = transactionId; // Set the transaction ID
  this.paymentMethod = paymentMethod; // Set the payment method
  this.paymentDate = new Date(); // Set the payment date to now
  this.paymentStatus = 'paid'; // Update the payment status to 'paid'

  // Create a receipt after updating payment details
  const project = await mongoose.model('Project').findById(this.projectId); // Fetch the associated project
  if (!project) {
    throw new Error('Project not found. Cannot generate receipt.');
  }

  await Receipt.generateReceipt(project._id, this.amount, this._id); // Generate the receipt
  await this.save(); // Save the updated invoice with payment details
};

export default mongoose.model('Invoice', invoiceSchema); // Export Invoice model
