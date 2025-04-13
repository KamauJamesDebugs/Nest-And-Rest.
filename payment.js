document.getElementById("pay-now").addEventListener("click", async () => {
    const phoneNumber = "254708374149"; // User's phone number
    const amount = 1200; // Total amount

    try {
        const response = await fetch("http://localhost:3000/mpesa/stkpush", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber, amount })
        });

        const data = await response.json();
        alert("STK Push sent! Please check your phone.");
        console.log("M-Pesa Response:", data);
    } catch (error) {
        console.error("Error:", error);
        alert("Payment failed. Try again.");
    }
});