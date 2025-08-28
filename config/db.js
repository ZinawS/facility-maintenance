const users = [];
const serviceHistory = [
  { id: 1, userId: 1, date: '2025-08-20', service: 'HVAC Maintenance', status: 'Completed' },
  { id: 2, userId: 1, date: '2025-08-15', service: 'Cooler Repair', status: 'Completed' }
];
const equipment = [
  { id: 1, userId: 1, model: 'Carrier X1', serial: '12345', lastService: '2025-08-20' },
  { id: 2, userId: 1, model: 'Trane Y2', serial: '67890', lastService: '2025-08-15' }
];
const feedback = [];
const blogs = [];

module.exports = { users, serviceHistory, equipment, feedback, blogs };