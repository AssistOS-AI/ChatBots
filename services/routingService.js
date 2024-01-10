export class routingService {
    constructor() {}
    async navigateToLocation(locationArray = [], appName) {
        const CHATBOTS_PAGE = "chatbots-select-personality-page";
        const PERSONALITY_PAGE = "personality";

        
        if (locationArray.length === 0 || locationArray[0] === CHATBOTS_PAGE) {
            const pageUrl = `${webSkel.currentUser.space.id}/${appName}/${CHATBOTS_PAGE}`;
            await webSkel.changeToDynamicPage(CHATBOTS_PAGE, pageUrl);
            return;
        }
        if(locationArray[locationArray.length-1]!== PERSONALITY_PAGE){
         console.error(`Invalid URL: URL must end with ${CHATBOTS_PAGE} or ${PERSONALITY_PAGE}`);
            return;
        }

        const webComponentName = locationArray[locationArray.length - 1];
        const pageUrl = `${webSkel.currentUser.space.id}/${appName}/${locationArray.join("/")}`;
        await webSkel.changeToDynamicPage(webComponentName, pageUrl);
    }
}
