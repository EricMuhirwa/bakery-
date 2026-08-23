import Joi from 'joi';

module.exports = {
  createStockItemSchema: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('Ingredients', 'Products', 'Packaging').required(),
    currentStock: Joi.number().min(0).required(),
    unit: Joi.string().required(),
    minStock: Joi.number().min(0).required(),
    maxStock: Joi.number().min(0).required(),
    reorderPoint: Joi.number().min(0).required(),
    supplier: Joi.string().required(),
    costPerUnit: Joi.number().min(0).required(),
  }),

  updateStockItemSchema: Joi.object({
    name: Joi.string(),
    category: Joi.string().valid('Ingredients', 'Products', 'Packaging'),
    unit: Joi.string(),
    minStock: Joi.number().min(0),
    maxStock: Joi.number().min(0),
    reorderPoint: Joi.number().min(0),
    supplier: Joi.string(),
    costPerUnit: Joi.number().min(0),
  }),

  stockInSchema: Joi.object({
    itemId: Joi.string().required(),
    quantity: Joi.number().min(0.01).required(),
    supplier: Joi.string().required(),
    batchNumber: Joi.string().allow('', null),
    expiryDate: Joi.string().isoDate().allow('', null),
    purchasePrice: Joi.number().min(0).allow(null),
    notes: Joi.string().allow('', null),
    reference: Joi.string().allow('', null),
  }),

  stockOutSchema: Joi.object({
    itemId: Joi.string().required(),
    quantity: Joi.number().min(0.01).required(),
    reason: Joi.string().required(),
    reference: Joi.string().required(),
    notes: Joi.string().allow('', null),
  }),
};

