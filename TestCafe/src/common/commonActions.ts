import { Selector, t} from 'testcafe';

class commonActions{
    public async launchApp(url : string){
        await t
        .maximizeWindow()
        .navigateTo(url);
    }
}

export default new commonActions;