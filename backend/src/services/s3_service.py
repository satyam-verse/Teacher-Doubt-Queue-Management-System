import logging
import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError
from flask import current_app

logger = logging.getLogger(__name__)

class S3Service:
    @staticmethod
    def get_s3_client():
        aws_key = current_app.config.get('AWS_ACCESS_KEY_ID')
        aws_secret = current_app.config.get('AWS_SECRET_ACCESS_KEY')
        aws_region = current_app.config.get('AWS_REGION', 'us-east-1')
        
        if not aws_key or not aws_secret:
            return None
        
        return boto3.client(
            's3',
            region_name=aws_region,
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
            config=BotoConfig(signature_version='s3v4')
        )

    @classmethod
    def generate_presigned_upload_url(cls, filename: str, content_type: str, expiration: int = 3600) -> dict:
        """
        Generate a presigned PUT URL for secure, direct-to-S3 client uploads.
        If AWS credentials are not configured, returns mock/local URL for development.
        """
        s3_client = cls.get_s3_client()
        bucket = current_app.config.get('AWS_S3_BUCKET', 'doubtx-attachments')
        
        # Safe S3 object key with timestamp prefix
        import uuid
        object_key = f"doubts/{uuid.uuid4().hex[:8]}_{filename}"
        
        if not s3_client:
            logger.info("AWS credentials not configured. Returning development mock upload URL.")
            return {
                'upload_url': f"/api/v1/uploads/mock-s3/{object_key}",
                'object_key': object_key,
                'file_url': f"https://mock-s3.local/{bucket}/{object_key}",
                'is_mock': True
            }

        try:
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket,
                    'Key': object_key,
                    'ContentType': content_type
                },
                ExpiresIn=expiration
            )
            file_url = f"https://{bucket}.s3.{current_app.config.get('AWS_REGION', 'us-east-1')}.amazonaws.com/{object_key}"
            return {
                'upload_url': presigned_url,
                'object_key': object_key,
                'file_url': file_url,
                'is_mock': False
            }
        except ClientError as e:
            logger.error(f"Error generating presigned S3 URL: {e}")
            raise
