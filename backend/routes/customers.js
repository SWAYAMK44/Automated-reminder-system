const express = require("express");
const router = express.Router();
const Customer = require("../models/Customers");

// 🚨 Important: Define `/reminders` route BEFORE `/:id` route
router.get("/reminders", async (req, res) => {
    try {
        const today = new Date();
        const twoDaysLater = new Date();
        twoDaysLater.setDate(today.getDate() + 2);

        const dueCustomers = await Customer.find({
            next_service_date: {
                $gte: today,
                $lte: twoDaysLater,
            },
        });

        res.json(dueCustomers);
    } catch (error) {
        console.error("❌ Error fetching reminders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch all customers
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        console.error("❌ Error fetching customers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch a specific customer by ID
router.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        console.error("❌ Error fetching customer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Add a new customer
router.post("/", async (req, res) => {
    try {
        const { name, vehicle_number, next_service_date } = req.body;

        const newCustomer = new Customer({
            name,
            vehicle_number,
            next_service_date,
        });

        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error("❌ Error adding customer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Update a customer by ID
router.put("/:id", async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCustomer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(updatedCustomer);
    } catch (error) {
        console.error("❌ Error updating customer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Delete a customer by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedCustomer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting customer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
