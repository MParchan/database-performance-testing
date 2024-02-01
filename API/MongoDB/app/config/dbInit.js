import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

dotenv.config();
// Adres URI bazy danych MongoDB
const uri = process.env.DB_CONNECTION_STRING;

// Funkcja do połączenia z bazą danych MongoDB
async function connectToDatabase() {
    const client = new MongoClient(uri);
    await client.connect();
    return client.db();
}

// Generowanie danych dla kolekcji Role i User
async function generateRolesAndUsers(db) {
    const rolesCollection = db.collection("Role");
    const usersCollection = db.collection("User");

    // Insert Roles
    await rolesCollection.insertMany([
        { RoleId: 1, Name: "Admin" },
        { RoleId: 2, Name: "User" },
        { RoleId: 3, Name: "Expert" },
    ]);

    // Admins
    for (let i = 1; i <= 10; i++) {
        await usersCollection.insertOne({
            UserId: i,
            RoleId: 1,
            FirstName: "Admin" + i,
            LastName: "AdminLastName" + i,
            Email: "admin" + i + "@example.com",
            PhoneNumber: i + 123453000,
            Password: "adminpassword" + i,
        });
    }

    // Experts
    for (let i = 11; i <= 1000; i++) {
        await usersCollection.insertOne({
            UserId: i,
            RoleId: 2,
            FirstName: "Expert" + i,
            LastName: "ExpertLastName" + i,
            Email: "expert" + i + "@example.com",
            PhoneNumber: i + 123454000,
            Password: "expertpassword" + i,
        });
    }

    // Users
    for (let i = 1001; i <= 10000; i++) {
        await usersCollection.insertOne({
            UserId: i,
            RoleId: 3,
            FirstName: "User" + i,
            LastName: "UserLastName" + i,
            Email: "user" + i + "@example.com",
            PhoneNumber: i + 123455000,
            Password: "userpassword" + i,
        });
    }
}

// Generowanie danych dla kolekcji Brand
async function generateBrands(db) {
    const brandsCollection = db.collection("Brand");

    for (let i = 1; i <= 1000; i++) {
        await brandsCollection.insertOne({
            BrandId: i,
            Name: "Brand Name " + i,
            Country: "Country " + faker.number.int({ min: 1, max: 100 }),
        });
    }
}

// Generowanie danych dla kolekcji Category
async function generateCategories(db) {
    const categoriesCollection = db.collection("Category");

    for (let i = 1; i <= 1000; i++) {
        await categoriesCollection.insertOne({
            CategoryId: i,
            Name: "Category " + i,
        });
    }
}

// Generowanie danych dla kolekcji Product
async function generateProducts(db) {
    const productsCollection = db.collection("Product");

    for (let i = 1; i <= 10000; i++) {
        const brandId = faker.number.int({ min: 1, max: 1000 });
        const categoryId = faker.number.int({ min: 1, max: 100 });

        await productsCollection.insertOne({
            ProductId: i,
            BrandId: brandId,
            CategoryId: categoryId,
            Name: "Product Name " + i,
            Description: "Product Description " + i,
            Price: parseFloat(faker.number.int({ min: 10, max: 1000, precision: 0.01 }).toFixed(2)),
            QuantityAvailable: faker.number.int({ min: 1, max: 100 }),
        });
    }
}

// Generowanie danych dla kolekcji Event
async function generateEvents(db) {
    const eventsCollection = db.collection("Event");

    for (let i = 1; i <= 1000; i++) {
        await eventsCollection.insertOne({
            EventId: i,
            Name: "Event Name " + i,
            Description: "Event Description " + i,
            Data: new Date(new Date().getTime() + faker.number.int({ min: 1, max: 365 }) * 24 * 60 * 60 * 1000),
        });
    }
}

// Generowanie danych dla kolekcji EventParticipant
async function generateEventParticipants(db) {
    const eventParticipantsCollection = db.collection("EventParticipant");

    for (let i = 1; i <= 20000; i++) {
        const userId = faker.number.int({ min: 1, max: 10000 });
        const eventId = faker.number.int({ min: 1, max: 1000 });

        await eventParticipantsCollection.insertOne({
            EventParticipantId: i,
            EventId: eventId,
            UserId: userId,
        });
    }
}

// Generowanie danych dla kolekcji Message
async function generateMessages(db) {
    const messagesCollection = db.collection("Message");

    for (let i = 1; i <= 10000; i++) {
        await messagesCollection.insertOne({
            MessageId: i,
            Sender: faker.number.int({ min: 1, max: 10000 }),
            Recipient: faker.number.int({ min: 1, max: 10000 }),
            Data: new Date(new Date().getTime() + faker.number.int({ min: 1, max: 365 }) * 24 * 60 * 60 * 1000),
            Content: "Message Content " + i,
        });
    }
}

// Generowanie danych dla kolekcji Visit
async function generateVisits(db) {
    const visitsCollection = db.collection("Visit");

    for (let i = 1; i <= 10000; i++) {
        await visitsCollection.insertOne({
            VisitId: i,
            Visitor: faker.number.int({ min: 1000, max: 10000 }),
            Expert: faker.number.int({ min: 10, max: 1000 }),
            Data: new Date(),
            Note: "Visit Note " + i,
        });
    }
}

// Generowanie danych dla kolekcji Order i OrderProduct
async function generateOrdersAndOrderProducts(db) {
    const ordersCollection = db.collection("Order");
    const orderProductsCollection = db.collection("OrderProduct");

    for (let i = 1; i <= 1000; i++) {
        const userId = faker.number.int({ min: 1, max: 1000 });
        const productId = faker.number.int({ min: 1, max: 10000 });

        // Wstawianie danych do kolekcji Order
        await ordersCollection.insertOne({
            OrderId: i,
            UserId: userId,
            OrderDate: new Date(),
        });

        // Wstawianie kilku pozycji zamówienia do kolekcji OrderProduct dla jednego zamówienia
        for (let j = 1; j <= faker.number.int({ min: 1, max: 10 }); j++) {
            await orderProductsCollection.insertOne({
                OrderProductId: i * 1000 + j,
                OrderId: i,
                ProductId: productId,
                Quantity: faker.number.int({ min: 1, max: 10 }),
            });
        }
    }
}

// Funkcja główna do uruchomienia skryptu
async function dbInit() {
    const db = await connectToDatabase();
    console.log("Start");
    await generateRolesAndUsers(db);
    console.log("RolesAndUsers");
    await generateBrands(db);
    console.log("Brands");
    await generateCategories(db);
    console.log("Categories");
    await generateProducts(db);
    console.log("Products");
    await generateEvents(db);
    console.log("Events");
    await generateEventParticipants(db);
    console.log("partici");
    await generateMessages(db);
    console.log("Messages");
    await generateVisits(db);
    console.log("Visits");
    await generateOrdersAndOrderProducts(db);
    console.log("OrdersAndOrderProducts");

    console.log("Dane zostały dodane do bazy MongoDB.");
}

export default dbInit;
