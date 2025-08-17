const express = require('express');
const app = express();
const productsRouter = require('./modules/products/index');
const { connectDatabase } = require('./modules/configs/db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", productsRouter);

app.get('/',(req,res) => { 
    res.send('Hello World!');
})

const db = async () => { 
    try {
        await connectDatabase();
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit the process if database connection fails
    }
}
db();


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})