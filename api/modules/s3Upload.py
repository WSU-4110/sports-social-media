import boto3
import os
import glob
import re
from botocore.exceptions import NoCredentialsError
from decouple import config
from modules.msteams_notify import sendMessage

ACCESS_KEY=config('ACCESS_KEY')
SECRET_KEY=config('SECRET_KEY')
BUCKET_NAME=config('BUCKET_NAME')
FOLDER_PATH=config('FOLDER_PATH')

def upload_to_aws(local_file, bucket, s3_file):
    s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
    try:
        print("Upload Successful for " + s3_file)
        s3.upload_file(local_file, bucket, s3_file)
        sendMessage("Upload Successful for {0}".format(s3_file) , "00FF00")
        return True
    except FileNotFoundError:
        print("The file was not found")
        sendMessage("The file was not found " + s3_file)
        return False
    except NoCredentialsError:
        print("Credentials not available")
        sendMessage("Credentials not available")
        return False
 

def getFiles():
    projectpath=os.path.dirname(os.path.abspath(__file__))       
    allFiles=glob.glob(projectpath+FOLDER_PATH+"/*")
    for theFile in allFiles:
        filePath=theFile
        s3File=re.sub(r'.*json_data.', '', filePath)
        upload_to_aws(filePath, BUCKET_NAME, s3File)