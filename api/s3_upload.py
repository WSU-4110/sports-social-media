import boto3
from botocore.exceptions import NoCredentialsError
from decouple import config
import os


ACCESS_KEY=config('ACCESS_KEY')
SECRET_KEY=config('SECRET_KEY')
FOLDER_PATH=config('FOLDER_PATH')

def upload_to_aws(local_file, bucket, s3_file):
    s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY,
                      aws_secret_access_key=SECRET_KEY)
    try:
        s3.upload_file(local_file, bucket, s3_file)
        print("Upload Successful for " + local_file)
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False
 

def getFiles():       
    for root, dirs, files in os.walk(FOLDER_PATH):
        for file in files:
                fullFile=FOLDER_PATH+file
                upload_to_aws(fullFile, 'sports-project-locater', fullFile)

getFiles()