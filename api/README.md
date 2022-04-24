## sports-social-media-profile-locater api

These are the files that are used to gather the data of the players for certain leagues. Currently, all files are setup for acquiring data of NBA players and teams. The below resources are used to create an API. 



## AWS Resources Needed

- [AWS EC2 Instance](https://aws.amazon.com/ec2/instance-types/)
- [AWS S3 Bucket](https://aws.amazon.com/s3/)
- [AWS API Gateway](https://aws.amazon.com/api-gateway/)

## General Flow

![alt text](https://github.com/WSU-4110/sports-social-media-profile-locater/blob/main/api/flow.jpg?raw=true)

# AWS S3 Bucket
https://aws.amazon.com/s3/

You will need to setup an AWS S3 bucket which will store the JSON files after each run of the script. The files contain the information about the players.

1. Sign in to the AWS Management Console and open the Amazon S3 console
2. Choose Create bucket
3. Create a bucket name
4. In Region, choose the AWS Region where you want the bucket to reside
5. In Bucket settings for Block Public Access, choose the Block Public Access settings that you want to apply to the bucket.
6. Choose Create bucket

# AWS EC2 Instance
https://aws.amazon.com/ec2/instance-types/

You will need to setup an AWS EC2 instance that will run the python files on a weekely run.

1. Launch An AWS EC2 Server And Set Up Ubuntu
2. Upload all the files from this current directory into the Ubuntu instance
3. Ensure you have python installed
4. Install all requirements
``
pip install requirements.txt
``
5. Setup a cronjob 
``
crontab -e //add cron job
``
6. Add cronjob
``
0 10 * * * /path/to/folder
``
# AWS API Gateway
https://aws.amazon.com/api-gateway/

You will need to setup an AWS API that will be connected to your AWS S3 bucket that has the JSON files. The API that is created allows your application to retrieve data.

1. [Set up IAM permissions for the API to invoke Amazon S3 actions](https://docs.aws.amazon.com/apigateway/latest/developerguide/permissions.html)
2. In the API Gateway console, create an API named MyS3. This API's root resource (/) represents the Amazon S3 service.
3. Under the API's root resource, create a child resource named Folder and set the required Resource Path as /{folder}.
4. For the API's Folder resource, create an Item child resource. Set the required Resource Path as /{item}.

# Microsoft Teams Webhook

This is used to send notifications to a Microsoft Teams channel that alerts the team if files are uploaded to the AWS S3 bucket successfully. Essentially alerting if the python script runs successfully.

1. Open the channel in which you want to add the webhook and select ••• More options from the top navigation bar.
2. Select Connectors from the dropdown menu:
3. Search for Incoming Webhook and select Add.
4. Select Configure, provide a name, and upload an image for your webhook if necessary:
5. Copy and save the unique webhook URL present in the dialog window. The URL maps to the channel and you can use it to send information to Teams. Select Done.

# Environment Variables

You are required to setup the following enviroment variables as shown in the .env.example file

1. FOLDER_PATH -- which is the folder where you want to store the json data locally before upload to S3
2. AWS ACCESS_KEY and SECRET_KEY
    - Open the IAM console at https://console.aws.amazon.com/iam/
    - On the navigation menu, choose Users.
    - Choose your IAM user name (not the check box).
    - Open the Security credentials tab, and then choose Create access key.
    - To see the new access key, choose Show. Your credentials resemble the following:
    - ACCESS_KEY will be the Access key ID
    - SECRET_KEY will be the Secret access key
3. BUCKET_NAME-- which is the AWS S3 bucket name that you created
4. MS_WEBHOOK-- which is the Microsoft Webhook URL that is created 
