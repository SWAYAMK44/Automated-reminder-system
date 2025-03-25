import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome for icons
import { faCar, faCalendarAlt, faPhone, faIdBadge } from "@fortawesome/free-solid-svg-icons"; // Import specific icons

function App() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    vehicle_number: "",
    last_service_date: "",
    next_service_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customers from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/customers")
      .then((response) => {
        setCustomers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
        setError("Failed to fetch customers. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/customers", formData)
      .then((response) => {
        alert("Customer added successfully!");
        setCustomers([...customers, response.data]); // Update UI with new customer
        setFormData({
          name: "",
          contact: "",
          vehicle_number: "",
          last_service_date: "",
          next_service_date: "",
        }); // Clear form
      })
      .catch((error) => {
        console.error("Error adding customer:", error);
        alert("Failed to add customer. Please try again.");
      });
  };

  return (
    <div>
      {/* Hero Section */}
      <div
        className="bg-dark text-white text-center py-5"
        style={{
          backgroundImage: "url('https://via.placeholder.com/1920x600?text=Wheel+Alignment+Service')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="display-4">Wheel Alignment Reminder</h1>
        <p className="lead">Manage your vehicle service reminders with ease.</p>
      </div>

      {/* Main Content */}
      <div className="container mt-5">
        {/* Add Customer Form */}
        <div className="card mb-4 shadow">
          <div className="card-body">
            <h4 className="card-title">
              <FontAwesomeIcon icon={faCar} className="me-2" />
              Add New Customer
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faIdBadge} className="me-2" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  Contact
                </label>
                <input
                  type="text"
                  name="contact"
                  className="form-control"
                  placeholder="Enter contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faCar} className="me-2" />
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  className="form-control"
                  placeholder="Enter vehicle number"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Last Service Date
                </label>
                <input
                  type="date"
                  name="last_service_date"
                  className="form-control"
                  value={formData.last_service_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Next Service Date
                </label>
                <input
                  type="date"
                  name="next_service_date"
                  className="form-control"
                  value={formData.next_service_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={faCar} className="me-2" />
                Add Customer
              </button>
            </form>
          </div>
        </div>

        {/* Customers List */}
        <div className="card shadow">
          <div className="card-body">
            <h4 className="card-title">
              <FontAwesomeIcon icon={faCar} className="me-2" />
              Customers List
            </h4>
            {loading ? (
              <p>Loading customers...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : customers.length === 0 ? (
              <p>No customers found.</p>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Vehicle Number</th>
                    <th>Last Service Date</th>
                    <th>Next Service Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.name}</td>
                      <td>{customer.contact}</td>
                      <td>{customer.vehicle_number}</td>
                      <td>{new Date(customer.last_service_date).toLocaleDateString()}</td>
                      <td>{new Date(customer.next_service_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <p className="mb-0">© 2023 Wheel Alignment Reminder. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;