from modules import gsearch
from modules import s3Upload

if __name__ == "__main__":
    #gsearch.get_teams()
    gsearch.get_players()
    s3Upload.getFiles()
