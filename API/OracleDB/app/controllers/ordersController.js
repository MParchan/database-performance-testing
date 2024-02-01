import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize } from "../config/dbConnection.js";
import ErrorWithStatus from "../middleware/errorWithStatus.js";

//@desc Get all orders
//@route GET /api/orders
//@access private
const allOrders = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            let result;
            connection = await oracledb.getConnection();
            if (req.user.role === "Admin") {
                result = await connection.execute(
                    "SELECT O.*, U.Email, LISTAGG(OP.Quantity || ',;,' || P.ProductId  || ',;,' || P.Name , ';.;') WITHIN GROUP (ORDER BY P.ProductId) AS Products FROM Pdb_Order O JOIN Pdb_User U ON O.UserId = U.UserId JOIN Pdb_OrderProduct OP ON O.OrderId = OP.OrderId JOIN Pdb_Product P ON P.ProductId = OP.ProductId GROUP BY O.OrderId, O.UserId, O.OrderDate, U.Email"
                );
            } else {
                result = await connection.execute(
                    "SELECT O.*, U.Email, LISTAGG(OP.Quantity || ',;,' || P.ProductId  || ',;,' || P.Name , ';.;') WITHIN GROUP (ORDER BY P.ProductId) AS Products FROM Pdb_Order O JOIN Pdb_User U ON O.UserId = U.UserId JOIN Pdb_OrderProduct OP ON O.OrderId = OP.OrderId JOIN Pdb_Product P ON P.ProductId = OP.ProductId WHERE O.UserId = :1 GROUP BY O.OrderId, O.UserId, O.OrderDate, U.Email",
                    [req.user.id]
                );
            }
            const jsonOrders = result.rows.map((row) => {
                const jsonOrder = {
                    orderId: row[0],
                    userId: row[1],
                    orderDate: row[2],
                    user: {
                        userId: row[1],
                        email: row[3],
                    },
                    products: [],
                };
                if (row[4]) {
                    const productsInfo = row[4].split(";.;");
                    for (const product of productsInfo) {
                        const [quantity, productId, name] = product.split(",;,");
                        jsonOrder.products.push({
                            productId: parseInt(productId),
                            name: name,
                            quantity: parseInt(quantity),
                        });
                    }
                }
                return jsonOrder;
            });
            res.status(200).json(jsonOrders);
        } catch (err) {
            console.log(err);
            res.status(500);
            next(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

//@desc Create new order
//@route POST /api/orders
//@access private
const createOrder = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { products } = req.body;
            if (products.length === 0) {
                throw new ErrorWithStatus("The order has no products", 400);
            }
            const isValid = products.every((product) => product.id !== undefined && product.quantity !== undefined);

            if (!isValid) {
                throw new ErrorWithStatus("Each product in the order must have 'id' and 'quantity'", 400);
            }
            connection = await oracledb.getConnection();
            for (const product of products) {
                const productChecking = await connection.execute(
                    "SELECT QuantityAvailable, Name FROM Pdb_Product WHERE ProductId = :1",
                    [product.id]
                );
                if (productChecking.rows[0][0] < product.quantity) {
                    throw new ErrorWithStatus(
                        `Product ${productChecking.rows[0][1]} is not available in this quantity`,
                        400
                    );
                }
            }
            const lastOrder = await connection.execute("SELECT MAX(OrderId) FROM Pdb_Order");
            const newOrderId = lastOrder.rows[0][0] + 1;
            const currentDate = new Date();
            await connection.execute("INSERT INTO Pdb_Order (OrderId, UserId, OrderDate) VALUES (:1, :2, :3)", [
                newOrderId,
                req.user.id,
                currentDate,
            ]);
            const lastOrderProduct = await connection.execute("SELECT MAX(OrderProductId) FROM Pdb_OrderProduct");
            let newOrderProductId = lastOrderProduct.rows[0][0] + 1;
            const jsonOrder = {
                orderId: newOrderId,
                userId: req.user.id,
                orderDate: currentDate,
                user: {
                    userId: req.user.id,
                    email: req.user.email,
                },
                products: [],
            };
            for (const product of products) {
                await connection.execute(
                    "INSERT INTO Pdb_OrderProduct (OrderProductId, OrderId, ProductId, Quantity) VALUES (:1, :2, :3, :4)",
                    [newOrderProductId, newOrderId, product.id, product.quantity]
                );
                await connection.execute(
                    "UPDATE Pdb_Product SET QuantityAvailable = QuantityAvailable - :1 WHERE ProductId = :2",
                    [product.quantity, product.id]
                );
                jsonOrder.products.push({
                    productId: product.id,
                    quantity: product.quantity,
                });
                newOrderProductId++;
            }
            await connection.execute("COMMIT");
            res.status(201).json({ jsonOrder });
        } catch (err) {
            console.log(err);
            res.status(err.status);
            next(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

//@desc Get order
//@route GET /api/orders/:id
//@access private
const getOrder = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            let result;
            connection = await oracledb.getConnection();
            if (req.user.role === "Admin") {
                result = await connection.execute(
                    "SELECT O.*, U.Email, LISTAGG(OP.Quantity || ',;,' || P.ProductId  || ',;,' || P.Name , ';.;') WITHIN GROUP (ORDER BY P.ProductId) AS Products FROM Pdb_Order O JOIN Pdb_User U ON O.UserId = U.UserId JOIN Pdb_OrderProduct OP ON O.OrderId = OP.OrderId JOIN Pdb_Product P ON P.ProductId = OP.ProductId WHERE O.OrderId = :1 GROUP BY O.OrderId, O.UserId, O.OrderDate, U.Email",
                    [id]
                );
            } else {
                result = await connection.execute(
                    "SELECT O.*, U.Email, LISTAGG(OP.Quantity || ',;,' || P.ProductId  || ',;,' || P.Name , ';.;') WITHIN GROUP (ORDER BY P.ProductId) AS Products FROM Pdb_Order O JOIN Pdb_User U ON O.UserId = U.UserId JOIN Pdb_OrderProduct OP ON O.OrderId = OP.OrderId JOIN Pdb_Product P ON P.ProductId = OP.ProductId WHERE O.OrderId = :1 AND O.UserId = :2 GROUP BY O.OrderId, O.UserId, O.OrderDate, U.Email",
                    [id, req.user.id]
                );
            }
            const jsonOrder = {
                orderId: result.rows[0][0],
                userId: result.rows[0][1],
                orderDate: result.rows[0][2],
                user: {
                    userId: result.rows[0][1],
                    email: result.rows[0][3],
                },
                products: [],
            };
            if (result.rows[0][4]) {
                const productsInfo = result.rows[0][4].split(";.;");
                for (const product of productsInfo) {
                    const [quantity, productId, name] = product.split(",;,");
                    jsonOrder.products.push({
                        productId: parseInt(productId),
                        name: name,
                        quantity: parseInt(quantity),
                    });
                }
            }

            res.status(200).json(jsonOrder);
        } catch (err) {
            console.log(err);
            res.status(500);
            next(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Error closing database connection:", err);
                }
            }
        }
    }
    try {
        await initialize();
        await queryDatabase();
    } catch (err) {
        console.error(err);
    }
});

export { allOrders, createOrder, getOrder };
