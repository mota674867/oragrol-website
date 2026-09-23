// ORAGROL Live Chat — Image Upload Route
// Place at: app/api/chat-upload/route.ts
//
// Accepts: JPG, JPEG, PNG, WEBP — max 5MB
// Stores in Vercel Blob with 3-day expiry key
// Returns a blob URL for display and forwarding

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;

    if (!file || !sessionId) {
      return NextResponse.json({ error: 'Missing file or sessionId' }, { status: 400 });
    }

    // MIME type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WEBP images are accepted.' },
        { status: 400 }
      );
    }

    // File header validation (basic magic bytes check)
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (!isValidImageHeader(bytes, file.type)) {
      return NextResponse.json({ error: 'Invalid image file.' }, { status: 400 });
    }

    // Size check
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image must be under 5MB.' },
        { status: 400 }
      );
    }

    // Store in Vercel Blob — key includes sessionId and 3-day expiry timestamp
    const expiryTs = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days from now
    const blobKey = `chat-uploads/${sessionId}/${expiryTs}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const blob = await put(blobKey, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      key: blobKey,
      expiresAt: expiryTs,
    });
  } catch (error) {
    console.error('[chat-upload] Error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

/**
 * Basic magic bytes validation to confirm file headers match declared MIME type
 */
function isValidImageHeader(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 4) return false;

  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      // JPEG: FF D8 FF
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    case 'image/png':
      // PNG: 89 50 4E 47
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      );

    case 'image/webp':
      // WEBP: 52 49 46 46 ... 57 45 42 50
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );

    default:
      return false;
  }
}
