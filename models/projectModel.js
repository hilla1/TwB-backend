// projectModel.js
import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { updateProjectProgress, setModuleDeadlines } from '../services/projectService.js';

const { Schema } = mongoose;

const milestoneSchema = new Schema({
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  complete: { type: Boolean, default: false },
});

const moduleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: Number, default: 1 },
  expertAssigned: { 
    type: Schema.Types.ObjectId, 
    ref: 'Expert', 
    autopopulate: { select: 'name title email' }
  },
  expertInfo: {
    name: { type: String, default: 'Anonymous' },
    avatar: { type: String, default: '/defaults/default-avatar.png' },
    title: { type: String, default: '' },
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  milestones: [milestoneSchema],
  percentage: { type: Number, required: true, min: 0, max: 100, default: 0 },
  price: {
    type: Number,
    default: function () {
      if (this.parent().totalPrice) {
        return (this.parent().totalPrice * this.percentage) / 100;
      }
      return 0;
    },
  },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  unassigned: { type: Boolean, default: true },
  expertAccepted: { type: Boolean, default: false },
  startTime: { type: Date, default: Date.now },
  deadline: { type: Date },
});

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  clientNumber: { type: String, required: true },
  modules: [moduleSchema],
  totalPrice: { type: Number, required: false, default: 0 },
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true, autopopulate: { select: 'name email avatar' } },
  approved: { type: Boolean, default: false },
  cashReady: { type: Boolean, default: false },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  manager: { type: Schema.Types.ObjectId, ref: 'User', default: null, autopopulate: { select: 'name email avatar' } },
});

projectSchema.plugin(autopopulate);
moduleSchema.plugin(autopopulate);

// Pre-save hook to set module deadlines based on the project deadline
projectSchema.pre('save', function (next) {
  setModuleDeadlines(this);  // Call service function
  next();
});

// Pre-save hook to calculate project progress based on the average module progress
projectSchema.pre('save', function (next) {
  updateProjectProgress(this);  // Call service function
  next();
});

export default mongoose.model('Project', projectSchema);
