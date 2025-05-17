/*
Script to automatize the next operations:
 10 users creation
 20 spaces creation
 1 admin creation
 Here we have all data and passwords to test
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User.model');
const Space = require('./models/Space.model');
const Contract = require('./models/Contract.model');
const Admin = require('./models/Admin.model');
const ChatGroup = require('./models/ChatGroup.model');
const Building = require('./models/Building.model');

mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

const seedDatabase = async () => {
    try {
        console.log("Clearing collections...");
        await Promise.all([
            User.deleteMany({}),
            Space.deleteMany({}),
            Contract.deleteMany({}),
            Admin.deleteMany({}),
            ChatGroup.deleteMany({}),
            Building.deleteMany({})
        ]);
        console.log("Collections cleared.");

        const passwordHash = await bcrypt.hash("111", 10);

        console.log("Creating users...");
        const users = await User.insertMany([
            { dni: "111111111", firstName: "Juan", lastName: "Perez", email: "juan@example.com", phoneNumber: "123456789", preference: "OWNER", password: passwordHash, validationStatus: "PENDING" },
            { dni: "222222222", firstName: "Ana", lastName: "Lopez", email: "ana@example.com", phoneNumber: "987654321", preference: "TENANT", password: passwordHash, validationStatus: "PENDING" },
            { dni: "333333333", firstName: "Carlos", lastName: "Martinez", email: "carlos@example.com", phoneNumber: "567890123", preference: "TENANT", password: passwordHash, validationStatus: "PENDING" },
            { dni: "444444444", firstName: "Laura", lastName: "Sanchez", email: "laura@example.com", phoneNumber: "123123123", preference: "OWNER", password: passwordHash, validationStatus: "PENDING" },
            { dni: "555555555", firstName: "Pedro", lastName: "Garcia", email: "pedro@example.com", phoneNumber: "321321321", preference: "OWNER", password: passwordHash, validationStatus: "PENDING" },
            { dni: "666666666", firstName: "Maria", lastName: "Ruiz", email: "maria@example.com", phoneNumber: "456456456", preference: "TENANT", password: passwordHash, validationStatus: "PENDING" },
            { dni: "777777777", firstName: "Lucia", lastName: "Fernandez", email: "lucia@example.com", phoneNumber: "654654654", preference: "OWNER", password: passwordHash, validationStatus: "PENDING" },
            { dni: "888888888", firstName: "Roberto", lastName: "Diaz", email: "roberto@example.com", phoneNumber: "789789789", preference: "TENANT", password: passwordHash, validationStatus: "PENDING" },
            { dni: "999999999", firstName: "Clara", lastName: "Moreno", email: "clara@example.com", phoneNumber: "987987987", preference: "OWNER", password: passwordHash, validationStatus: "PENDING" },
            { dni: "000000001", firstName: "Oumar", lastName: "Traore", email: "oumar@example.com", phoneNumber: "000111222", preference: "OWNER", password: passwordHash, validationStatus: "PENDING" }
        ]);

        console.log("Users created:", users.map(u => u.email));

        const findUserByDni = (dni) => users.find(u => u.dni === dni);

        const allSpaces = [];

        const oumarSpaces = await Space.insertMany([
            { spaceType: "APARTMENT", squareMeters: 70, rooms: 3, ownerDni: "000000001", description: "Modern apartment", status: "OCCUPIED", validationStatus: "APPROVED", monthlyPrice: 900 },
            { spaceType: "GARAGE", squareMeters: 20, ownerDni: "000000001", description: "Private garage spot", status: "OCCUPIED", validationStatus: "APPROVED", monthlyPrice: 150 },
            { spaceType: "APARTMENT", squareMeters: 90, rooms: 4, ownerDni: "000000001", description: "Spacious flat", status: "OCCUPIED", validationStatus: "APPROVED", monthlyPrice: 1100 },
            { spaceType: "GARAGE", squareMeters: 18, ownerDni: "000000001", description: "Underground parking", status: "OCCUPIED", validationStatus: "APPROVED", monthlyPrice: 100 }
        ]);
        allSpaces.push(...oumarSpaces);

        const otherSpaces = [
            { ownerDni: "111111111" },
            { ownerDni: "444444444" },
            { ownerDni: "555555555" },
            { ownerDni: "777777777" },
            { ownerDni: "999999999" }
        ];

        const spaceTypes = ["APARTMENT", "GARAGE"];
        const statuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"];

        for (let i = 0; i < 16; i++) {
            const randomOwner = otherSpaces[Math.floor(Math.random() * otherSpaces.length)].ownerDni;
            const space = await Space.create({
                spaceType: spaceTypes[i % 2],
                squareMeters: 40 + (i % 4) * 10,
                rooms: spaceTypes[i % 2] === "APARTMENT" ? 2 + (i % 3) : undefined,
                ownerDni: randomOwner,
                description: `Space #${i + 1}`,
                status: statuses[i % 3],
                validationStatus: "APPROVED",
                monthlyPrice: 400 + (i % 5) * 100
            });
            allSpaces.push(space);
        }

        const tenants = users.filter(u => u.preference === "TENANT" && u.dni !== "000000001");

        console.log("Creating contracts for Oumar's properties...");
        for (let i = 0; i < oumarSpaces.length; i++) {
            await Contract.create({
                spaceId: oumarSpaces[i]._id,
                ownerDni: "000000001",
                tenantDni: tenants[i % tenants.length].dni,
                contractType: "RENT",
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                monthlyPayment: oumarSpaces[i].monthlyPrice,
                initialPayment: oumarSpaces[i].monthlyPrice * 2,
                lateFee: 50,
                paymentStatus: "PENDING",
                contractStatus: "ACTIVE",
                contractDocument: "",
                validationStatus: "PENDING"
            });
        }

        console.log("Creating contracts where Oumar is tenant...");
        const oumarTenantSpaces = [
            { spaceType: "GARAGE", squareMeters: 25, ownerDni: "111111111", description: "Garage rented by Oumar", status: "OCCUPIED", validationStatus: "APPROVED", monthlyPrice: 160 },
            { spaceType: "APARTMENT", squareMeters: 65, rooms: 2, ownerDni: "444444444", description: "Flat rented by Oumar", status: "OCCUPIED", validationStatus: "APPROVED", monthlyPrice: 800 }
        ];

        for (const spaceData of oumarTenantSpaces) {
            const space = await Space.create(spaceData);
            await Contract.create({
                spaceId: space._id,
                ownerDni: space.ownerDni,
                tenantDni: "000000001",
                contractType: "RENT",
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                monthlyPayment: space.monthlyPrice,
                initialPayment: space.monthlyPrice * 2,
                lateFee: 50,
                paymentStatus: "PENDING",
                contractStatus: "ACTIVE",
                contractDocument: "",
                validationStatus: "PENDING"
            });
        }

        console.log("Creating admin...");
        await Admin.create({
            email: "admin@secuo.com",
            password: await bcrypt.hash("Romingsware8!", 10)
        });

        console.log("Database seeded successfully.");

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        mongoose.disconnect();
    }
};

seedDatabase();
