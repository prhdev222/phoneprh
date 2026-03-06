module.exports = async (req, res) => {
  const appsScriptUrl = process.env.APPSCRIPT_URL;

  if (!appsScriptUrl) {
    return res.status(500).json({ error: 'APPSCRIPT_URL is not configured on the server.' });
  }

  try {
    if (req.method === 'GET') {
      const url = appsScriptUrl + (appsScriptUrl.includes('?') ? '&' : '?') + 'action=all';
      const upstreamRes = await fetch(url);
      const data = await upstreamRes.json();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Vercel อาจส่ง req.body เป็น string หรือ object
      let body = req.body || {};
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {
          body = {};
        }
      }

      const upstreamRes = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data = {};
      try {
        data = await upstreamRes.json();
      } catch (_) {
        // ถ้า Apps Script ไม่ได้ส่ง JSON กลับมาก็ให้เป็น object ว่าง
      }

      return res.status(upstreamRes.ok ? 200 : 500).json(data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  } catch (error) {
    return res.status(500).json({ error: 'Failed to contact Apps Script.' });
  }
};

