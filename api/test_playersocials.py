from os import name
import unittest
from modules.gsearch import get_instagram
from modules.gsearch import get_all_social
from modules.gsearch import get_twitter
from modules.gsearch import get_instagram
from modules.gsearch import get_facebook


class PlayerSocialsTest(unittest.TestCase):
    def test_for_lebron_twitter(self):
        allProfiles = get_all_social("lebron james")
        actual = allProfiles[0]
        expected = 'https://twitter.com/KingJames'
        self.assertEqual(actual, expected)

    def test_for_lebron_instagram(self):
        allProfiles = get_all_social("lebron james")
        actual = allProfiles[1]
        expected = 'https://www.instagram.com/kingjames'
        self.assertEqual(actual, expected)

    def test_for_lebron_facebook(self):
        allProfiles = get_all_social("lebron james")
        actual = allProfiles[2]
        expected = 'https://www.facebook.com/LeBron'
        self.assertEqual(actual, expected)

    def test_for_player_standalone_twitter(self):
        actual = get_twitter("lebron james")
        expected = "https://twitter.com/kingjames#:~:text=LeBron%20James%20(%40KingJames)%20%2F%20Twitter"
        self.assertEqual(actual, expected)

    def test_for_player_standalone_instagram(self):
        actual = get_instagram("lebron james")
        expected = "https://www.instagram.com/kingjames/?hl=en"
        self.assertEqual(actual, expected)

    def test_for_player_standalone_facebook(self):
        actual = get_facebook("lebron james")
        expected = "https://facebook.com/LeBron"
        self.assertEqual(actual, expected)


if __name__ == '__main__':
    unittest.main()
