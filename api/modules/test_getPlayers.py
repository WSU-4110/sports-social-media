from os import name
import unittest
from modules.gsearch import get_players, get_singlePlayer

class testGetPlayers(unittest.TestCase):

    def test_ifStatement1(self):
        actual = get_singlePlayer(1)[0]
        print(actual)
        expected = 200
        self.assertEqual(actual,expected)

    def test_for_playerName(self):
        actual = get_singlePlayer(1)[1]
        actual = actual['athletes'][0]['fullName']
        expected = "Bogdan Bogdanovic"
        self.assertEqual(actual,expected)

    def test_for_position(self):
        actual = get_singlePlayer(1)[1]
        actual = actual['athletes'][0]['position']['abbreviation']
        expected = "SG"
        self.assertEqual(actual,expected)

    def test_for_Jersey(self):
        actual = get_singlePlayer(1)[1]
        actual = actual['athletes'][0]['jersey']
        expected = "13"
        self.assertEqual(actual,expected)
    
    def test_forHeadshot(self):
        actual = get_singlePlayer(1)[1]
        actual = actual['athletes'][0]['headshot']['href']
        expected = "https://a.espncdn.com/i/headshots/nba/players/full/3037789.png"
        self.assertEqual(actual,expected)

    def test_forHeight(self):
        actual = get_singlePlayer(1)[1]
        actual = actual['athletes'][0]['displayWeight']
        expected = "225 lbs"
        self.assertEqual(actual,expected)
        