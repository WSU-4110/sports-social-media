import pymsteams
from decouple import config

MS_WEBHOOK = config("MS_WEBHOOK")

def sendMessage(message):
    myTeamsMessage = pymsteams.connectorcard(MS_WEBHOOK)
    myTeamsMessage.text(message)
    # myTeamsMessage.addLinkButton("This is the button Text", "https://github.com")
    myTeamsMessage.send()

sendMessage("Testing")