import requests
import re
import time
import json
import os
import glob
from operator import itemgetter
from .constants import google_headers, espn_headers
from decouple import config

FOLDER_PATH=config('FOLDER_PATH')

## STANDALONE INSTAGRAM SEARCH ##
def get_instagram(name):
    player=name.replace(" ", "+")
    html = requests.get('https://www.google.com/search?q='+ player +'+nba+instagram&hl=en', headers=google_headers)
    response = str(html.text)
    instagram = re.search('href="https:\/\/www.instagram.com\/([^"]+)"', response)
    if instagram:
        instagram= instagram.group(1)
        instagram = "https://www.instagram.com/"+instagram
    else:
        instagram=""
    return instagram
   
   
## STANDALONE TWITTER SEARCH ##    
def get_twitter(name):
    player=name.replace(" ", "+")
    html = requests.get('https://www.google.com/search?q='+ player +'+nba+twitter&hl=en', headers=google_headers)
    response = str(html.text)
    twitter = re.search(r'href="https:\/\/twitter.com\/([^"]+)"', response)
    if twitter:
        twitter= twitter.group(1)
        twitter="https://twitter.com/"+ twitter
    else:
        twitter=""
    return twitter


## GOOGLE ALL SEARCH ##
def get_all_social(name):
    player=name.replace(" ", "+")
    html = requests.get('https://www.google.com/search?q='+ player +'+nba&hl=en', headers=google_headers)
    response = str(html.text)

    ## REGEX MATCHES FOR SOCIAL MEDIA ##
    twitter = re.search(r'<g-link class="fl"><a.*\shref="https:\/\/.*twitter.com\/([^"]+)"', response)
    instagram = re.search(r'<g-link class="fl"><a.*\shref="https:\/\/www.instagram.com\/([^"]+)"', response)
    facebook = re.search(r'<g-link class="fl"><a.*\shref="https:\/\/www.facebook.com\/([^"]+)"', response)
    
    ## CHECK IF TWITTER MATCH EXISTS  (IF NOT USE TWITTER STANDALONE FUNCTION FOR ONE MORE CHECK) ##
    if twitter:
        twitter= twitter.group(1)
        twitter = re.sub(r'&amp;.*', '', twitter)
        twitter="https://twitter.com/"+ twitter
    else:
        twitter=get_twitter(name) 
    
    ## CHECK IF INSTAGRAM MATCH EXISTS  (IF NOT USE INSTAGRAM STANDALONE FUNCTION FOR ONE MORE CHECK) ##            
    if instagram:
        instagram= instagram.group(1)
        instagram="https://www.instagram.com/"+instagram
    else:
        instagram=get_instagram(name)
    
    ## CHECK IF FACEBOOK MATCH EXISTS ##    
    if facebook:
        facebook= facebook.group(1)
        facebook="https://www.facebook.com/"+facebook
    else:
        facebook=""
        
    return twitter, instagram, facebook

## ESPN GET TEAMS AND ID ##
def get_teams():
    the_data = []
    i = 1
    while i <= 30:
        response = requests.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/'+ str(i) + '/roster', headers=espn_headers)
        data = response.json()
        team=data['team']['displayName']
        logo=data['team']['logo']
        division=data['team']['standingSummary']
        division = re.sub(r'(.*in\s)', '', division)
        team_data = {"id": i , "team": team, "logo": logo, "division": division}
        the_data.append(team_data)
        i+=1

    the_data = sorted(the_data, key=itemgetter('team'))
    the_data=json.dumps(the_data, indent=4)
    save_to_json("teams", the_data)
     

def get_individual_teams(i):
        response = requests.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/'+ str(i) + '/roster', headers=espn_headers)
        status = response.status_code
        data = response.json()
        if status == 200 and len(data) > 0:
            return status, data
        return status


## ESPN GET PLAYERS AND GOOGLE SEARCH SOCIAL MEDIA ##
def get_players():
    the_data = []
    i=1
    ## LOOP THROUGH 30 TEAMS ##
    while i <= 30: 
        status, data = get_individual_teams(i)
        team=data['team']['displayName']
        team_logo=data['team']['logo']
        team_color=data['team']['color']
        team_data = {'team': team, "teamLogo": team_logo, "teamColor": team_color}
        the_data.append(team_data)
        print("Getting data for " + team)
        for value in data['athletes']:
            name=value['fullName']
            position=value['position']['abbreviation']
            try:
                jersey=value['jersey']
            except:
                jersey=""
            try:
                headshot=value['headshot']['href']
            except:
                headshot=""
            try:
                eLink=value['links'][0]['href']
            except:
                eLink=""
            twitter, instagram, facebook= get_all_social(name)
            player_data = {"name": name , "position": position ,"jersey": jersey, "eLink": eLink, "eLink": eLink, "headshot": headshot, "twitter": twitter, "instagram": instagram, "facebook": facebook}
            the_data.append(player_data)
            time.sleep(5) ## ADD SLEEP TO TIMEOUT GOOGLE SEARCH A LITTLE
        the_data=json.dumps(the_data, indent=4)
        save_to_json(team, the_data)
        the_data = []
        i+=1
    generate_all()       
 
## GENERATE ALL JSON FILE
def generate_all():
    projectpath=os.path.dirname(os.path.abspath(__file__))       
    allFiles=glob.glob(projectpath+FOLDER_PATH+"/*")
    allJson= '{0}{1}/all.json'.format(projectpath, FOLDER_PATH)
    result=[]
    for theFile in allFiles:
        if 'all.json' in theFile or 'teams.json' in theFile: 
            print(theFile)
            continue
        with open(theFile, 'r') as infile:
            result.extend(json.load(infile))
            infile.close()
    with open(allJson, 'w') as output_file:
        json.dump(result, output_file, indent=4)
        output_file.close()

## SAVE ALL PLAYER DATA INCLUDING SOCIAL MEDIA ACCOUNTS TO JSON ##
def save_to_json(team, data):
    team=(team.replace(" " , "_")).lower()
    
    ## FILE PATH ##
    filename = team +".json"
    dirname = os.path.dirname(os.path.abspath(__file__))   
    path = "%s/%s/%s" %(dirname, FOLDER_PATH, filename)

    ## SAVE TO FILE ##
    file = open(path, 'w')
    file.write(data)
    file.close()
    print("Saved " + filename )

def get_singlePlayer(i):
     response = requests.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/'+ str(i) + '/roster', headers=espn_headers)
     data = response.json()
     status = response.status_code
     if status == 200 and len(data) > 0:
         return status, data
     return status
