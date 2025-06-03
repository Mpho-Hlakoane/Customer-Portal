const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;
const SECRET = 'verysecretkey123'; 

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));


const users = [];
const employees = [];
const payments = [];

(async () => {
  const hashedPassword = await bcrypt.hash('Customer101', 12);
  users.push({
    fullName: 'Mpho Customer',
    username: 'mphocustomer',
    idNumber: '0212068975310',
    accountNumber: '0246897531',
    password: hashedPassword,
  });
  console.log('✅ Test customer added:\n', users[0]);
})();

(async () => {
  const hashedPassword = await bcrypt.hash('Employee101', 12);
  employees.push({
    fullName: 'Hlakoane Employee',
    username: 'hlakoaneemployee',
    employeeId: 'HLKNMP0001',
    password: hashedPassword,
  });
  console.log('✅ Test employee added:\n', employees[0]);
})();

app.get('/', (req, res) => {
  res.send('✅ Backend API is running.');
});

app.post('/api/register', async (req, res) => {
  const { fullName, idNumber, accountNumber, password } = req.body;

  if (!/^[a-zA-Z\s]+$/.test(fullName)) return res.status(400).send('Invalid name');
  if (!/^\d{13}$/.test(idNumber)) return res.status(400).send('Invalid ID number');
  if (!/^\d{10,12}$/.test(accountNumber)) return res.status(400).send('Invalid account number');
  if (!password || password.length < 8) return res.status(400).send('Weak password');

  const existingUser = users.find(u => u.accountNumber === accountNumber);
  if (existingUser) return res.status(409).send('User already exists');

  const hashedPassword = await bcrypt.hash(password, 12);
  const username = fullName.replace(/\s+/g, '').toLowerCase();

  users.push({ fullName, username, idNumber, accountNumber, password: hashedPassword });

  res.status(201).send('Registered');
});

app.post('/api/login', async (req, res) => {
  const { username, accountNumber, password } = req.body;

  if (!/^[a-zA-Z0-9]+$/.test(username)) return res.status(400).send('Invalid username');
  if (!/^\d{10,12}$/.test(accountNumber)) return res.status(400).send('Invalid account number');
  if (!password) return res.status(400).send('Password required');

  const user = users.find(u => u.username === username && u.accountNumber === accountNumber);
  if (!user) return res.status(401).send('Invalid username or account number');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Incorrect password');

  const token = jwt.sign(
    { role: 'customer', username: user.username, accountNumber: user.accountNumber },
    SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

app.post('/api/employee-login', async (req, res) => {
  const { username, employeeId, password } = req.body;

  if (!/^[a-zA-Z0-9]+$/.test(username)) return res.status(400).send('Invalid username');
  if (!/^[A-Z]{6}\d{4}$/.test(employeeId)) return res.status(400).send('Invalid employee ID');
  if (!password) return res.status(400).send('Password required');

  const employee = employees.find(e => e.username === username && e.employeeId === employeeId);
  if (!employee) return res.status(401).send('Invalid username or employee ID');

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) return res.status(401).send('Incorrect password');

  const token = jwt.sign(
    { role: 'employee', username: employee.username, employeeId: employee.employeeId },
    SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/api/pay', authenticateToken, (req, res) => {
  if (req.user.role !== 'customer') return res.sendStatus(403);

  const { amount, currency, provider, payeeAccount, swiftCode } = req.body;

  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return res.status(400).send('Invalid amount');
  if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).send('Invalid currency');
  if (provider !== 'SWIFT') return res.status(400).send('Invalid provider');
  if (!/^\d{10,12}$/.test(payeeAccount)) return res.status(400).send('Invalid payee account');
  if (!/^[A-Z]{6}[A-Z0-9]{2,5}$/.test(swiftCode)) return res.status(400).send('Invalid SWIFT code');

  const payment = {
    fromAccount: req.user.accountNumber,
    toAccount: payeeAccount,
    swiftCode,
    amount,
    currency,
    provider,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  payments.push(payment);
  res.status(201).send('Payment submitted successfully');
});

app.get('/api/payments', authenticateToken, (req, res) => {
  if (req.user.role !== 'employee') return res.sendStatus(403);
  res.json(payments);
});

app.patch('/api/payments/:index', authenticateToken, (req, res) => {
  if (req.user.role !== 'employee') return res.sendStatus(403);

  const { index } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).send('Invalid status');
  }

  if (!payments[index]) {
    return res.status(404).send('Payment not found');
  }

  payments[index].status = status;
  payments[index].updatedAt = new Date().toISOString();

  res.json({ message: `Payment ${status.toLowerCase()} successfully.` });
});

mongoose.connect('mongodb://localhost:27017/customerPortal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
