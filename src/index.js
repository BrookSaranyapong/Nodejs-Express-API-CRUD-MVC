const express = require('express');
const app = express();
const productsRouter = require('./modules/products/index');
const authRouter = require('./modules/auth/index');
const { connectDatabase, syncDB } = require('./configs/db');
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/product", productsRouter);
app.use("/api/v1/auth", authRouter);

app.get('/',(req,res) => { 
    res.send('Hello World!');
})

const PORT = process.env.PORT || 3000;

(async () => {
  await syncDB();
  app.listen(PORT, () => console.log(`Server on :${PORT}`));
})();