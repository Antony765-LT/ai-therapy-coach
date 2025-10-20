import React from "react";
import { useNavigate } from "react-router-dom";

const PackagesPage = () => {
  const navigate = useNavigate();

  const packages = [
    { id: 1, name: "Daily Package", duration: 24, price: 833 },
    { id: 2, name: "Weekly Package", duration: 168, price: 6250 },
    { id: 3, name: "Monthly Package", duration: 730, price: 25000 },
    { id: 4, name: "Yearly Package", duration: 8760, price: 300000 },
  ];

  const handleManualPayment = (pkg) => {
    localStorage.setItem("selectedPackage", JSON.stringify(pkg));
    navigate("/manual-payment");
  };

  const handlePaypalPayment = (pkg) => {
    localStorage.setItem("selectedPackage", JSON.stringify(pkg));
    navigate("/paypal-payment");
  };

  const handleMpesaPayment = (pkg) => {
    localStorage.setItem("selectedPackage", JSON.stringify(pkg));
    navigate("/mpesa-payment"); // ✅ fixed lowercase path
  };

  return (
    <div style={styles.container}>
      <h2>Choose Your Package</h2>
      <div style={styles.packagesGrid}>
        {packages.map((pkg) => (
          <div key={pkg.id} style={styles.card}>
            <h3>{pkg.name}</h3>
            <p>⏱ Duration: {pkg.duration} hours</p>
            <p>💰 Price: Ksh {pkg.price.toLocaleString()}</p>

            <div style={styles.buttonGroup}>
              <button style={styles.payBtn} onClick={() => handleMpesaPayment(pkg)}>
                Lipa na M-Pesa
              </button>
              <button style={styles.payBtn} onClick={() => handlePaypalPayment(pkg)}>
                PayPal (USD)
              </button>
              <button style={styles.manualBtn} onClick={() => handleManualPayment(pkg)}>
                Pay Direct to Phone
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: 20, textAlign: "center" },
  packagesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20,
    marginTop: 20,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  buttonGroup: { display: "flex", flexDirection: "column", gap: 10, marginTop: 10 },
  payBtn: {
    padding: "10px 15px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  manualBtn: {
    padding: "10px 15px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
};

export default PackagesPage;

