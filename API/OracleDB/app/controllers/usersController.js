import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ErrorWithStatus from "../middleware/errorWithStatus.js";
import { initialize } from "../config/dbConnection.js";

//@desc User registration
//@route GET /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { firstName, lastName, email, phoneNumber, password } = req.body;
            if (!firstName || !lastName || !email || !phoneNumber || !password) {
                throw new ErrorWithStatus("All fields are mandatory", 400);
            }
            connection = await oracledb.getConnection();
            const emailAvailable = await connection.execute("SELECT * FROM Pdb_User WHERE Email = :1", [email]);
            if (emailAvailable.rows.length) {
                throw new ErrorWithStatus("Email alredy in use", 400);
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const lastUser = await connection.execute("SELECT MAX(UserId) AS maxUserId FROM Pdb_User");
            const maxUserId = lastUser.rows[0][0];
            const newUserId = maxUserId + 1;
            const result = await connection.execute(
                "INSERT INTO Pdb_User (UserId, RoleId, FirstName, LastName, Email, PhoneNumber, Password) VALUES (:1, :2, :3, :4, :5, :6, :7)",
                [newUserId, 2, firstName, lastName, email, phoneNumber, hashedPassword]
            );
            await connection.execute("COMMIT");
            if (!result.rowsAffected) {
                throw new ErrorWithStatus("User data is not valid", 400);
            }
            res.status(201).json({ message: "User registration successful" });
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

//@desc User login
//@route GET /api/users/register
//@access public
const loginUser = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new ErrorWithStatus("All fields are mandatory", 400);
            }
            connection = await oracledb.getConnection();
            const user = await connection.execute(
                "SELECT U.*, R.Name AS RoleName FROM Pdb_User U JOIN Pdb_Role R ON U.RoleId = R.RoleId WHERE Email = :1",
                [email]
            );
            if (!user.rows.length || !(await bcrypt.compare(password, user.rows[0][6]))) {
                throw new ErrorWithStatus("Email or password is not valid", 401);
            }
            const accessToken = jwt.sign(
                {
                    user: {
                        id: user.rows[0][0],
                        email: user.rows[0][4],
                        firstName: user.rows[0][2],
                        lastName: user.rows[0][3],
                        role: user.rows[0][7],
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1m" }
            );
            res.status(200).json({ accessToken });
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

//@desc Current user info
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

export { registerUser, loginUser, currentUser };
