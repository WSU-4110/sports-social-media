from os import name
import unittest
from .gsearch import get_individual_teams

class TeamInfoTest(unittest.TestCase):
    def test_for_500(self):
        actual=get_individual_teams("weee")
        expected=500
        self.assertEqual(actual, expected)

    def test_for_200(self):
        actual=get_individual_teams(1)[0]
        expected=200
        self.assertEqual(actual, expected)

    def test_for_team_name(self):
        actual=get_individual_teams(1)[1]
        actual=actual['team']['displayName']
        expected="Atlanta Hawks"
        self.assertEqual(actual, expected)

    def test_for_team_color(self):
        actual=get_individual_teams(1)[1]
        actual=actual['team']['color']
        expected="002B5C"
        self.assertEqual(actual, expected)

    def test_for_team_players(self):
        actual=get_individual_teams(1)[1]
        actual=actual['athletes']
        expected=""
        self.assertIsNot(actual, expected)

    def test_for_team_logo(self):
        actual=get_individual_teams(1)[1]
        actual=actual['team']['logo']
        expected=""
        self.assertIsNot(actual, expected)


if __name__ == '__main__':
    unittest.main()