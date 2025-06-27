const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher'
};

const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue'
};

const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque'
};

const BATCH_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended'
};

module.exports = {
  ROLES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  BATCH_STATUS
};