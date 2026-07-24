require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db')
const authRouter = require('./routes/authroutes')
const studentRouter = require('./routes/studentRoutes')
const bookRouter = require('./routes/bookroutes')
const catalogRouter = require('./routes/catalogroutes')
//MIDDLEWARES
app.use(cors())
app.use(express.json());
//DB
connectDB();
//ROUTES
app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/book', bookRouter);
app.use('/api/catalog', catalogRouter);
app.get('/', (req, res) => {
    res.send('API WORKING');
})

app.listen(PORT, () => {
    console.log(`server listening to the http://localhost:${PORT}`);
})