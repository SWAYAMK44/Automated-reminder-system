require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
const moment = require("moment-timezone");
const Customer = require("./models/Customer");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Normalize date (Set time to 00:00:00)
const normalizeDate = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// ✅ Get all customers
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add a new customer
app.post("/api/customers", async (req, res) => {
  try {
    const { name, contact, vehicle_number, last_service_date, next_service_date } = req.body;
    if (!name || !contact || !vehicle_number || !last_service_date || !next_service_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newCustomer = new Customer({
      name,
      contact: contact.startsWith("+") ? contact : `+91${contact}`,
      vehicle_number,
      last_service_date: new Date(last_service_date),
      next_service_date: new Date(next_service_date),
    });
    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch customers due in the next 2 days
app.get("/api/customers/due-soon", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const twoDaysLater = new Date(startOfDay);
    twoDaysLater.setDate(today.getDate() + 2);
    twoDaysLater.setHours(23, 59, 59, 999);

    console.log("🔍 Checking customers due between:", startOfDay, "and", twoDaysLater);
    const customersDue = await Customer.find({ next_service_date: { $gte: startOfDay, $lte: twoDaysLater } });
    res.json(customersDue);
  } catch (error) {
    console.error("❌ Error fetching due customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Send WhatsApp message via UltraMSG
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    const instance = process.env.ULTRAMSG_INSTANCE;
    const token = process.env.ULTRAMSG_TOKEN;
    const url = `https://api.ultramsg.com/${instance}/messages/chat`;
    const response = await axios.post(url, { token, to: phoneNumber, body: message });
    console.log(`✅ WhatsApp message sent to ${phoneNumber}:`, response.data);
  } catch (error) {
    console.error(`❌ Error sending WhatsApp message to ${phoneNumber}:`, error.response?.data || error.message);
  }
};

// ✅ Cron Job: Run every day at 9 AM IST (03:30 UTC)
cron.schedule("* * * * *", async () => {
  const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  console.log(`🚀 Cron Job Running at: ${now}`);

  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const twoDaysLater = new Date(startOfDay);
    twoDaysLater.setDate(today.getDate() + 2);
    twoDaysLater.setHours(23, 59, 59, 999);

    console.log("🔍 Fetching customers due between:", startOfDay, "and", twoDaysLater);

    const customersDue = await Customer.find({
      next_service_date: { $gte: startOfDay, $lte: twoDaysLater },
    });

    // Log the list of due customers
    if (customersDue.length > 0) {
      console.log("📢 Customers due for service in the next 2 days:");
      customersDue.forEach((customer) => {
        console.log(
          `- ${customer.name} (${customer.vehicle_number}): Service due on ${customer.next_service_date.toDateString()}`
        );
      });
    } else {
      console.log("🚫 No due customers found.");
    }

    // Send WhatsApp reminders
    if (customersDue.length > 0) {
      console.log("📢 Sending reminders to:", customersDue.map(c => c.contact));
      for (const customer of customersDue) {
        const message = `🔔 Reminder: Hello ${customer.name}, your vehicle (${customer.vehicle_number}) is due for a service on ${customer.next_service_date.toDateString()}. Please schedule your appointment.`;
        await sendWhatsAppMessage(customer.contact, message);
      }
      console.log("✅ Reminders sent!");
    } else {
      console.log("🚫 No due customers found.");
    }
  } catch (error) {
    console.error("❌ Error in cron job:", error);
  }
}, {
  timezone: "Asia/Kolkata" // Explicitly set the time zone
});

// ✅ Delete all customers (for testing purposes)
app.delete("/api/customers", async (req, res) => {
  try {
    // Delete all customers from the database
    await Customer.deleteMany({});
    res.status(200).json({ success: true, message: "All customers deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// ✅ Route to manually send a WhatsApp message for testing
app.post("/api/send-message", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: "Phone number and message are required" });
    }
    await sendWhatsAppMessage(phoneNumber, message);
    res.status(200).json({ success: true, message: `Message sent to ${phoneNumber}` });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
});

// ✅ Test endpoint for manual reminders
app.get("/api/test-reminder", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const twoDaysLater = new Date(startOfDay);
    twoDaysLater.setDate(today.getDate() + 2);
    twoDaysLater.setHours(23, 59, 59, 999);

    console.log("🔍 Fetching customers due between:", startOfDay, "and", twoDaysLater);

    const customersDue = await Customer.find({ next_service_date: { $gte: startOfDay, $lte: twoDaysLater } });
    if (customersDue.length === 0) {
      return res.json({ message: "✅ No customers with service due in the next 2 days." });
    }

    // Log the list of due customers
    console.log("📢 Customers due for service in the next 2 days:");
    customersDue.forEach((customer) => {
      console.log(
        `- ${customer.name} (${customer.vehicle_number}): Service due on ${customer.next_service_date.toDateString()}`
      );
    });

    // Send WhatsApp reminders
    for (const customer of customersDue) {
      const message = `🔔 Reminder: Hello ${customer.name}, your vehicle (${customer.vehicle_number}) is due for a service on ${customer.next_service_date.toDateString()}. Please schedule your appointment.`;
      await sendWhatsAppMessage(customer.contact, message);
    }
    res.json({ success: true, message: "Reminders sent!", customersDue });
  } catch (error) {
    console.error("❌ Error in test reminder:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});