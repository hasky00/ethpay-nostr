const { nwc } = require('@getalby/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { paymentHash } = JSON.parse(event.body);

    if (!paymentHash) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing paymentHash' }) };
    }

    const client = new nwc.NWCClient({ nostrWalletConnectUrl: process.env.NWC_URL });

    const result = await client.lookupInvoice({ paymentHash });

    await client.close();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        paid: result.paid,
        settledAt: result.settledAt || null,
      }),
    };
  } catch (err) {
    console.error('check-payment error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
