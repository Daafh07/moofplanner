export const users = [
  {
    id: '6c8f0b9e-7b2c-4f59-9fd1-9f179dcd0c10',
    name: 'Planner Admin',
    email: 'planner@moofplanner.com',
    password: 'planner123',
  },
  {
    id: 'c1c43931-1f5a-4aa4-9009-3a7e3e6f6b1a',
    name: 'Store Manager',
    email: 'manager@moofplanner.com',
    password: 'manager123',
  },
];

export const customers = [
  {
    id: 'b6c815fb-4307-4d0b-a856-0bcd940d2570',
    name: 'Moof Retail Group',
    email: 'contact@moofretail.com',
    image_url: '/customers/moof-retail.png',
  },
  {
    id: 'a2f957b1-7c6f-4d4e-86a7-4a2d4ddd8d8f',
    name: 'Urban Grocery',
    email: 'info@urbangrocery.com',
    image_url: '/customers/urban-grocery.png',
  },
];

export const invoices = [
  {
    customer_id: customers[0].id,
    amount: 324500,
    status: 'paid',
    date: '2024-08-12',
  },
  {
    customer_id: customers[1].id,
    amount: 418000,
    status: 'pending',
    date: '2024-08-15',
  },
];

export const revenue = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 14100 },
  { month: 'Mar', revenue: 15200 },
  { month: 'Apr', revenue: 14850 },
  { month: 'May', revenue: 16200 },
  { month: 'Jun', revenue: 17500 },
];
