import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-helpers';
import { uploadToS3, validateUpload, generateStoragePath } from '@/lib/s3';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    const validation = validateUpload({
      size: file.size,
      type: file.type,
      name: file.name,
    });

    if (!validation.valid) {
      return errorResponse(validation.error!, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = generateStoragePath(folder, file.name);
    const url = await uploadToS3(buffer, storagePath, file.type);

    const fileRecord = await prisma.fileUpload.create({
      data: {
        originalName: file.name,
        storagePath,
        url,
        mimeType: file.type,
        size: file.size,
        uploadedById: (session!.user as any).id,
      },
    });

    await logAudit({
      action: 'UPLOAD',
      entityType: 'File',
      entityId: fileRecord.id,
      userId: (session!.user as any).id,
      details: { fileName: file.name, size: file.size, mimeType: file.type },
    });

    return jsonResponse({
      success: true,
      data: {
        id: fileRecord.id,
        url: fileRecord.url,
        name: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Upload failed', 500);
  }
}
