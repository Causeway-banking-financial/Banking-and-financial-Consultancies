import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Config: any = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// Use MinIO endpoint for local development
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true;
}

export const s3Client = new S3Client(s3Config);

const BUCKET = process.env.S3_BUCKET_NAME || 'causeway-uploads';
const MAX_SIZE = (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '15', 10)) * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export function validateUpload(file: { size: number; type: string; name: string }) {
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${process.env.MAX_UPLOAD_SIZE_MB || 15}MB` };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed. Allowed: PDF, DOCX, XLSX, PPTX, JPEG, PNG, WebP, SVG' };
  }
  return { valid: true, error: null };
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  if (process.env.S3_ENDPOINT) {
    return `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
  }
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export function generateStoragePath(folder: string, fileName: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const uniqueId = Date.now().toString(36);
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${folder}/${year}/${month}/${uniqueId}-${sanitized}`;
}
