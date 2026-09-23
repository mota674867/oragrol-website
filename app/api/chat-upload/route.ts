// ORAGROL Live Chat — Image Upload Route
// Accepts visitor screenshots: JPG, PNG, WEBP up to 5MB
// Note: @vercel/blob must be added to package.json before this stores files.
// Until then, returns a placeholder acknowledgment so the widget doesn't break.

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are accepted.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 });
    }

    // TODO: Store in Vercel Blob once @vercel/blob is added to package.json
    // For now return a placeholder so the widget works without blob storage
    return NextResponse.json({
      url: null,
      key: null,
      pending: true,
      message: 'Image received — blob storage not yet configured.',
    });
  } catch (error) {
    console.error('[chat-upload] Error:', error);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
