const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz-wRNYWTnybpfc2OdRh-5MFYO0FkDm-IEvnVIJhVejd5bAA6_PQJVpp-uyFPNmB-Zh/exec";

let processCount = 0;

// Billing tiers definition array used for the evaluation loop requirement
const billingTiers = [
    { limit: 20, rate: 25.00 },
    { limit: 40, rate: 35.00 },
    { limit: 60, rate: 45.00 },
    { limit: Infinity, rate: 60.00 }
];

document.getElementById('billingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // DOM Selection / Input gathering
    const name = document.getElementById('customerName').value.trim();
    const consumptionInput = document.getElementById('consumption').value;
    const consumption = parseFloat(consumptionInput);
    const customerType = document.getElementById('customerType').value;

    // Form input basic validation
    if (!name || isNaN(consumption) || consumption < 0) {
        alert("Please provide valid form inputs before running generation.");
        return;
    }

    let applicableRate = 0;
    for (let i = 0; i < billingTiers.length; i++) {
        if (consumption <= billingTiers[i].limit) {
            applicableRate = billingTiers[i].rate;
            break; // Valid matched bracket found
        }
    }

    // Calculating components
    const totalAmount = consumption * applicableRate;
    let discountPercent = 0;

    // Conditional Control Structure evaluation for discount tiers
    switch(customerType) {
        case 'Senior Citizen':
            discountPercent = 0.25;
            break;
        case 'Solo Parent':
            discountPercent = 0.15;
            break;
        case 'Regular':
        default:
            discountPercent = 0.00;
            break;
    }

    const calculatedDiscount = totalAmount * discountPercent;
    const finalNetBill = totalAmount - calculatedDiscount;

    // Incrementing counter instance variables 
    processCount++;
    document.getElementById('transactionCount').innerText = processCount;

    // Generating text block matching specific formatting structure
    const receiptHTML = `==============================
        WATER BILLING
==============================

Customer Name : ${name}
Customer Type : ${customerType}
Water Usage   : ${consumption.toFixed(2)} cu.m
Rate          : P${applicableRate.toFixed(2)}/cu.m
------------------------------
Amount        : P${totalAmount.toFixed(2)}
Discount      : P${calculatedDiscount.toFixed(2)}
------------------------------
TOTAL BILL    : P${finalNetBill.toFixed(2)}
==============================`;

    // DOM update rendering injection
    const receiptBox = document.getElementById('billingStatement');
    receiptBox.innerText = receiptHTML;
    receiptBox.classList.remove('hidden');

    // Fire data tracking to Google Spreadsheet Database mapping asynchronously
    sendDataToGoogleSheets(name, consumption, customerType, applicableRate, totalAmount, calculatedDiscount, finalNetBill);
});

function sendDataToGoogleSheets(name, consumption, type, rate, amount, discount, netBill) {
    if (WEB_APP_URL.includes("https://script.google.com/macros/s/AKfycbz-wRNYWTnybpfc2OdRh-5MFYO0FkDm-IEvnVIJhVejd5bAA6_PQJVpp-uyFPNmB-Zh/exec")) {
        console.warn("Spreadsheet submission bypassed. Please setup and replace the WEB_APP_URL endpoint variable.");
        return;
    }

    const formData = new FormData();
    formData.append("customerName", name);
    formData.append("waterConsumption", consumption);
    formData.append("customerType", type);
    formData.append("rate", rate);
    formData.append("amount", amount);
    formData.append("discount", discount);
    formData.append("totalBill", netBill);

    // Using fetch API with cors/no-cors fallback parameters for cross-domain sheet logging
    fetch(WEB_APP_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors"
    })
    .then(() => console.log("Transaction successfully appended to Remote Data Store Sheet."))
    .catch(err => console.error("Data ingestion failure structural response error:", err));
}
