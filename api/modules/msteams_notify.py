import pymsteams
from decouple import config

MS_WEBHOOK=config('MS_WEBHOOK')

def sendMessage(message, color):
	myTeamsMessage = pymsteams.connectorcard(MS_WEBHOOK)
	myTeamsMessage.text(message)
	myTeamsMessage.color(color)
	#myTeamsMessage.addLinkButton("This is the button Text", "https://github.com")
	myTeamsMessage.send()