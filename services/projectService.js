// services/projectService.js
import Invoice from '../models/invoiceModel.js';
import Receipt from '../models/receiptModel.js';
import Expert from '../models/expertModel.js';

export async function generateInvoice(project) {
  if (project.totalPrice > 0) {
    await Invoice.generateInvoice(project._id, project.totalPrice);
  }
}

export async function processPayment(project) {
  if (!project.cashReady) {
    throw new Error('Project is not cash ready for payment.');
  }
  await generateReceipt(project);
}

export async function generateReceipt(project) {
  if (project.totalPrice > 0) {
    const invoice = await Invoice.findOne({ projectId: project._id });
    await Receipt.generateReceipt(project._id, project.totalPrice, invoice._id);
  }
}

export async function updateExpertEarnings(project) {
  if (!project.cashReady) {
    console.log('Project is not cash ready. Expert earnings will not be updated.');
    return;
  }

  for (const module of project.modules) {
    if (module.expertAssigned) {
      module.unassigned = false;

      const expert = await Expert.findById(module.expertAssigned);
      if (expert) {
        expert.moduleEarnings.push({
          moduleId: module._id,
          amount: module.price,
          projectId: project._id,
        });
        expert.totalEarnings += module.price;
        await expert.save();
      }
    }
  }
}

export function updateProjectProgress(project) {
  if (project.modules && project.modules.length > 0) {
    const totalProgress = project.modules.reduce((acc, module) => acc + module.progress, 0);
    project.progress = totalProgress / project.modules.length;
  }
}

export function setModuleDeadlines(project) {
  if (!project.deadline) {
    throw new Error('Project must have a deadline.');
  }

  project.modules.forEach((module) => {
    if (!module.deadline) {
      module.deadline = project.deadline;
    }
  });
}
