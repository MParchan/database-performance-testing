import asyncHandler from "express-async-handler";
import oracledb from "oracledb";
import { initialize } from "../config/dbConnection.js";
import ErrorWithStatus from "../middleware/errorWithStatus.js";

//@desc Get all events
//@route GET /api/events
//@access public
const allEvents = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT * FROM Pdb_Event");
            const jsonEvents = result.rows.map((row) => {
                const jsonEvent = {
                    eventId: row[0],
                    name: row[1],
                    description: row[2],
                    date: row[3],
                };
                return jsonEvent;
            });
            res.status(200).json(jsonEvents);
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

//@desc Get events in which the user participates
//@route GET /api/events/user
//@access private
const getUserEvents = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute(
                "SELECT * FROM Pdb_Event E JOIN Pdb_EventParticipant EP ON E.EventId = EP.EventID JOIN pdb_User U ON U.UserId = EP.UserId WHERE U.UserId = :1",
                [req.user.id]
            );
            const jsonEvents = result.rows.map((row) => {
                const jsonEvent = {
                    eventId: row[0],
                    name: row[1],
                    description: row[2],
                    date: row[3],
                };
                return jsonEvent;
            });
            res.status(200).json(jsonEvents);
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

//@desc Create new event
//@route POST /api/events
//@access private
const createEvent = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { name, description, date } = req.body;
            if (req.user.role !== "Admin" && req.user.role !== "Expert") {
                throw new ErrorWithStatus("You do not have the appropriate permissions", 401);
            }
            if (!name || !description || !date) {
                throw new ErrorWithStatus("All fields are mandatory", 400);
            }
            connection = await oracledb.getConnection();
            const result = await connection.execute("SELECT MAX(EventId) FROM Pdb_Event");
            const newEventId = result.rows[0][0] + 1;
            const formattedDate = new Date(date);
            await connection.execute(
                "INSERT INTO Pdb_Event (EventId, Name, Description, Data) VALUES (:1, :2, :3, :4)",
                [newEventId, name, description, formattedDate]
            );
            await connection.execute("COMMIT");
            res.status(201).json({ categoryId: newEventId, name: name, description: description, date: date });
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

//@desc Get event
//@route GET /api/events/:id
//@access public
const getEvent = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { id } = req.params;
            connection = await oracledb.getConnection();
            const event = await connection.execute("SELECT * FROM Pdb_Event WHERE EventId = :1", [id]);
            if (event.rows.length === 0) {
                throw new ErrorWithStatus("Event not found", 404);
            }
            res.status(200).json({
                eventId: event.rows[0][0],
                name: event.rows[0][1],
                description: event.rows[0][2],
                date: event.rows[0][3],
            });
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

//@desc Join to the event
//@route POST /api/events/join
//@access private
const joinEvent = asyncHandler(async (req, res, next) => {
    async function queryDatabase() {
        let connection;
        try {
            const { eventId } = req.body;
            if (!eventId) {
                throw new ErrorWithStatus("All fields are mandatory", 400);
            }
            connection = await oracledb.getConnection();
            const event = await connection.execute("SELECT * FROM Pdb_Event WHERE EventId = :1", [eventId]);
            if (event.rows.length === 0) {
                throw new ErrorWithStatus("Event not found", 404);
            }
            const result = await connection.execute("SELECT MAX(EventParticipantId) FROM Pdb_EventParticipant");
            const newEventParticipantId = result.rows[0][0] + 1;
            await connection.execute(
                "INSERT INTO Pdb_EventParticipant (EventParticipantId, EventId, UserId) VALUES (:1, :2, :3)",
                [newEventParticipantId, eventId, req.user.id]
            );
            await connection.execute("COMMIT");
            res.status(200).json({ message: `You have joined the event: ${event.rows[0][1]}` });
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

export { allEvents, createEvent, getEvent, getUserEvents, joinEvent };
