const { nwc } = require('@getalby/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { buyerPubkey, product, amount, paymentHash } = JSON.parse(event.body);

    if (!buyerPubkey || !product) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing buyerPubkey or product' }) };
    }

    const client = new nwc.NWCClient({ nostrWalletConnectUrl: process.env.NWC_URL });

    const message = `✅ Payment confirmed!\n\nProduct: ${product}\nAmount: ${amount} sats\nTX: ${paymentHash}\n\nThank you for your purchase on NostrPay Store.`;

    await client.sendMessage({ pubkey: buyerPubkey, message });
    await client.close();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ sent: true }),
    };
  } catch (err) {
    console.error('send-dm error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
