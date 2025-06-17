const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'placed', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  address: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  payment: {
    method: {
      type: String,
      enum: ['cash_on_delivery', 'online'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    transactionId: String,
    paymentDetails: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    paidAt: Date
  }
}, {
  timestamps: true
});

// Add pre-save middleware to validate order only on creation
orderSchema.pre('save', function(next) {
  // Only validate required fields if this is a new order
  if (this.isNew) {
    if (this.items.length === 0) {
      next(new Error('Order must have at least one item'));
    }
  }
  next();
});

// Add method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'placed'].includes(this.status);
};

// Add method to check if order can be placed
orderSchema.methods.canBePlaced = function() {
  return this.status === 'pending';
};

// Add method to update order status without validation
orderSchema.methods.updateStatus = async function(newStatus) {
  if (!['pending', 'placed', 'completed', 'cancelled'].includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  // Use findOneAndUpdate to bypass validation
  const updatedOrder = await this.constructor.findOneAndUpdate(
    { _id: this._id },
    { $set: { status: newStatus } },
    { new: true, runValidators: false }
  ).populate('user', 'name email').populate('items.product', 'name price');
  
  if (!updatedOrder) {
    throw new Error('Order not found');
  }
  
  return updatedOrder;
};

// Add method to update payment status
orderSchema.methods.updatePaymentStatus = async function(status, transactionId = null, paymentDetails = null) {
  const updateData = {
    'payment.status': status
  };

  if (transactionId) {
    updateData['payment.transactionId'] = transactionId;
  }

  if (paymentDetails) {
    updateData['payment.paymentDetails'] = paymentDetails;
  }

  if (status === 'completed') {
    updateData['payment.paidAt'] = new Date();
  }

  const updatedOrder = await this.constructor.findOneAndUpdate(
    { _id: this._id },
    { $set: updateData },
    { new: true, runValidators: false }
  ).populate('user', 'name email').populate('items.product', 'name price');

  if (!updatedOrder) {
    throw new Error('Order not found');
  }

  return updatedOrder;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 