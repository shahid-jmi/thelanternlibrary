import crypto from 'node:crypto';
import sharp from 'sharp';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import r2Client from '../../config/r2.js';
import env from '../../config/env.js';

const COVER_IMAGE_PREFIX = 'covers';
const MAX_WIDTH_PX = 1200;
const WEBP_QUALITY = 80;

export interface UploadedCoverImage {
  url: string;
  key: string;
}

const processCoverImage = (buffer: Buffer): Promise<Buffer> =>
  sharp(buffer)
    .resize({ width: MAX_WIDTH_PX, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

export const uploadCoverImageAsset = async (buffer: Buffer): Promise<UploadedCoverImage> => {
  const processedBuffer = await processCoverImage(buffer);
  const key = `${COVER_IMAGE_PREFIX}/${crypto.randomUUID()}.webp`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
      Body: processedBuffer,
      ContentType: 'image/webp',
    })
  );

  return { url: `${env.r2PublicUrl}/${key}`, key };
};

export const deleteCoverImageAsset = async (key: string): Promise<void> => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
    })
  );
};
