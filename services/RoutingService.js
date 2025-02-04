export class RoutingService {
    constructor() {}
    async navigateToLocation(locationArray = [], appName) {
        const CHATBOTS_SELECT_PERSONALITY_PAGE = "chatbots-select-personality-page";
        const PERSONALITY_PAGE = "personality";
	const CHATBOTS_PAGE ="chatbots-page"
        
        if (locationArray.length === 0 || locationArray[0] === CHATBOTS_SELECT_PERSONALITY_PAGE ) {
            const pageUrl = `${assistOS.space.id}/${appName}/${CHATBOTS_SELECT_PERSONALITY_PAGE }`;
            await assistOS.UI.changeToDynamicPage(CHATBOTS_SELECT_PERSONALITY_PAGE, pageUrl);
            return;
        }

        const webComponentName = locationArray[0];
        const pageUrl = `${assistOS.space.id}/${appName}/${locationArray.join("/")}`;
        await assistOS.UI.changeToDynamicPage(webComponentName, pageUrl);
    }
}
