import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize } from "../config/dbConnection.js";

//@desc Get all roles
//@route GET /api/roles
//@access public
const allRoles = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT * FROM Pdb_Role");
            const jsonRoles = result.rows.map((row) => {
                const jsonRole = {
                    roleId: row[0],
                    name: row[1],
                };
                return jsonRole;
            });
            res.status(200).json(jsonRoles);
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

//@desc Create new role
//@route POST /api/roles
//@access public
const createRole = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { name } = req.body;
            if (!name) {
                throw new Error("All fields are mandatory");
            }
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT MAX(RoleId) AS maxRoleId FROM Pdb_Role");
            const maxRoleId = result.rows[0][0];
            const newRoleId = maxRoleId + 1;
            await connection.execute("INSERT INTO Pdb_Role (RoleId, Name) VALUES (:1, :2)", [newRoleId, name]);
            await connection.execute("COMMIT");
            res.status(201).json({ roleId: newRoleId, name: name });
        } catch (err) {
            console.log(err);
            res.status(400);
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

//@desc Get role
//@route GET /api/roles/:id
//@access public
const getRole = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const role = await connection.execute("SELECT * FROM Pdb_Role WHERE RoleId = :1", [id]);
            if (role.rows.length === 0) {
                throw new Error("Role not found");
            }
            res.status(200).json({ roleId: role.rows[0][0], name: role.rows[0][1] });
        } catch (err) {
            console.log(err);
            res.status(404);
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

//@desc Update role
//@route PUT /api/roles/:id
//@access public
const updateRole = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            const { name } = req.body;
            connection = await oracledb.getConnection();
            const role = await connection.execute("SELECT * FROM Pdb_Role WHERE RoleId = :1", [id]);
            if (role.rows.length === 0) {
                throw new Error("Role not found");
            }
            let updatedName = name ? name : role.rows[0][1];
            await connection.execute("UPDATE Pdb_Role SET Name = :1 WHERE RoleId = :3", [updatedName, id]);
            await connection.execute("COMMIT");
            res.status(200).json({ roleId: Number(id), name: updatedName });
        } catch (err) {
            console.log(err);
            res.status(404);
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

//@desc Delete role
//@route DELETE /api/roles/:id
//@access public
const deleteRole = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const result = await connection.execute("DELETE FROM Pdb_Role WHERE RoleId = :1", [id]);
            if (!result.rowsAffected) {
                throw new Error("Role not found");
            }
            await connection.execute("COMMIT");
            res.status(200).json({ message: `Successfully removed role with id: ${id}` });
        } catch (err) {
            console.log(err);
            next(err);
            res.status(404);
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

export { allRoles, createRole, getRole, updateRole, deleteRole };
