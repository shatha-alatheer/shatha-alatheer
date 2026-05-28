export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, action, code } = req.body;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SID;
  const credentials = Buffer.from(accountSid + ':' + authToken).toString('base64');

  if (action === 'send') {
    const response = await fetch(
      'https://verify.twilio.com/v2/Services/' + verifySid + '/Verifications',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + credentials,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'To=' + encodeURIComponent(phone) + '&Channel=sms'
      }
    );
    const data = await response.json();
    return res.status(200).json(data);
  }

  if (action === 'verify') {
    const response = await fetch(
      'https://verify.twilio.com/v2/Services/' + verifySid + '/VerificationCheck',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + credentials,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'To=' + encodeURIComponent(phone) + '&Code=' + encodeURIComponent(code)
      }
    );
    const data = await response.json();
    return res.status(200).json({ valid: data.status === 'approved' });
  }

  return res.status(400).json({ error: 'invalid action' });
}
