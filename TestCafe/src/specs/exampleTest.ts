import { Selector } from "testcafe";
import commonActions from "../common/commonActions";
import { baseUrl } from '../enviroment-testing-options';


fixture("Example Test");

test("Test Navbar Title", async (t) => {
    await commonActions.launchApp(baseUrl);
    await t.expect(Selector("#navbarTitle").innerText).eql("Sports Social Media Profile | NBA");
});