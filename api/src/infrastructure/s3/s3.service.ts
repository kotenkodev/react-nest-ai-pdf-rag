import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const UPLOAD_TTL_SECONDS = 300;
const DOWNLOAD_TTL_SECONDS = 3600;

@Injectable()
export class S3Service {
  private readonly bucketName: string;
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'AWS_S3_BUCKET',
      'pdf-pipeline-dev-pdf-uploads',
    );
    this.client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });
  }

  async getDownloadUrl(key: string, userFilename?: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentDisposition: userFilename
        ? `attachment; filename="${encodeURIComponent(userFilename)}"`
        : 'attachment',
    });
    return await getSignedUrl(this.client, command, {
      expiresIn: DOWNLOAD_TTL_SECONDS,
    });
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_TTL_SECONDS,
    });
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }
}
