const http = require('http');

function testInput(name, rawConversation) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      title: name,
      businessContext: 'Commercial Contract Test',
      rawConversation,
      consentAcknowledged: true
    });

    const req = http.request('http://localhost:3000/api/analyse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const json = JSON.parse(body);
        console.log(`\n=== TEST: ${name} ===`);
        console.log('STATUS:', res.statusCode);
        console.log('Party A:', json.extractedData.partyA.name);
        console.log('Party B:', json.extractedData.partyB.name);
        console.log('Scope:', json.extractedData.scopeOrProducts.value);
        console.log('Quantity:', json.extractedData.quantity.value);
        console.log('Price:', json.extractedData.price.value);
        console.log('Delivery:', json.extractedData.deliveryTimeline.value);
        console.log('Payment:', json.extractedData.paymentTerms.value);
        console.log('Completeness:', json.extractedData.completenessScore + '%');
        console.log('Missing items count:', json.extractedData.missingTerms.length);
        resolve();
      });
    });
    req.write(payload);
    req.end();
  });
}

async function main() {
  // Test 1: User's bulleted confirmation message
  await testInput('User Bullet Confirmation', `"Ravi, so we're on the same page regarding our agreement:
• Scope: 100 ergonomic office chairs (100 units)
• Consideration: ₹50,000 (INR)
• Delivery: within 10 days
• Payment: after delivery
Please reply 'Confirmed' to lock this version."`);

  // Test 2: Standard unstructured conversational chat
  await testInput('Unstructured WhatsApp Negotiation', `Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm.`);

  // Test 3: Tech services development contract
  await testInput('Mobile App Contract', `Hey Alex, we can develop the mobile app for ₹1,50,000 plus GST. We will complete it within 30 days. Payment terms: 50% advance, balance on completion.`);

  // Test 4: Master All-Aspects Corporate Agreement
  await testInput('Master All-Aspects Agreement', `Seller: CloudCraft Solutions Pvt Ltd
Buyer: Ramesh Kumar (Zenith Enterprises)
Regarding the corporate order:
• Scope: 150 Ergonomic Mesh Chairs with adjustable lumbar support (150 units)
• Consideration: ₹75,000 INR (exclusive of 18% GST)
• Delivery: within 14 days
• Logistics: free shipping handled by seller
• Payment: 30% advance, balance within 7 days of delivery
• Inspection: inspection period 3 days upon delivery
Please confirm so we can lock this agreement.`);
}

main();
