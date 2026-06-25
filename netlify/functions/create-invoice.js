const { nwc } = require('@getalby/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, product, buyerPubkey } = JSON.parse(event.body);

    if (!amount || !product) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing amount or product' }) };
    }

    const client = new nwc.NWCClient({ nostrWalletConnectUrl: process.env.NWC_URL });

    const invoice = await client.makeInvoice({
      amount: amount, // in sats
      description: `NostrPay: ${product}`,
    });

    await client.close();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        invoice: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
        product,
        buyerPubkey,
        amount,
      }),
    };
  } catch (err) {
    console.error('create-invoice error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
