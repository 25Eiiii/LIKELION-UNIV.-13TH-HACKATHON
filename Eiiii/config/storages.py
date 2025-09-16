from storages.backends.s3boto3 import S3Boto3Storage

class StaticStorage(S3Boto3Storage):
    location = "static"
    default_acl = None
    file_overwrite = True
    object_parameters = {
        "CacheControl": "public, max-age=2592000, immutable"  # 30d
    }

class MediaStorage(S3Boto3Storage):
    location = "media"
    default_acl = None
    file_overwrite = False
    # 업로드 파일은 보수적으로
    object_parameters = {
        "CacheControl": "no-cache"
    }