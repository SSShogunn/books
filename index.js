require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require("./utils/connectDB")
const authRoutes = require("./routes/authRoutes")
const coreRoutes = require("./routes/coreRoutes")
const featureRoutes = require("./routes/featureRoutes")

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Book Review API is running...');
});

app.use("/auth", authRoutes)
app.use("/", coreRoutes)
app.use("/", featureRoutes)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});