import mongoose from 'mongoose';

const { Schema } = mongoose;

// Schema for receipt
const receiptSchema = new Schema({
  receiptId: { type: String, required: true, unique: true }, // Unique receipt ID
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, // Reference to the project
  amount: { type: Number, required: true }, // Amount paid
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true }, // Reference to the invoice
  createdAt: { type: Date, default: Date.now }, // Receipt creation date
  updatedAt: { type: Date, default: Date.now }, // Receipt last updated date
});

// Method to generate a receipt
receiptSchema.statics.generateReceipt = async function (projectId, amount, invoiceId) {
  const receiptId = `REC-${invoiceId}-${Date.now()}`; // Generate a unique receipt ID
  const receipt = new this({ // Create a new receipt instance
    receiptId,
    projectId,
    amount,
    invoiceId,
  });
  
  await receipt.save(); // Save the receipt to the database
  return receipt; // Return the created receipt
};

export default mongoose.model('Receipt', receiptSchema); // Export Receipt model
