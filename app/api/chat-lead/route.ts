import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, company } = await req.json();
    if (!email || !name) return NextResponse.json({ ok: false }, { status: 400 });
    if (!process.env.HUBSPOT_ACCESS_TOKEN) return NextResponse.json({ ok: true });

    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const [firstName, ...lastParts] = name.split(' ');

    const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST', headers,
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
        properties: ['email'], limit: 1,
      }),
    });
    const searchData = await searchRes.json();

    if (searchData.results?.length > 0) {
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${searchData.results[0].id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ properties: { lead_source: 'Live Chat', company: company || '' } }),
      });
    } else {
      await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST', headers,
        body: JSON.stringify({
          properties: { email, firstname: firstName, lastname: lastParts.join(' ') || '', company: company || '', lead_source: 'Live Chat' },
        }),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[chat-lead] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
