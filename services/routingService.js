export class routingService {
    constructor() {}
    async navigateToLocation(locationArray = [], appName) {
        const CHATBOTS_PAGE = "chatbots-select-personality-page";
        const PERSONALITY_PAGE = "personality";

        // Validate the first segment of locationArray
        if (locationArray.length === 0 || (locationArray[0] !== CHATBOTS_PAGE && locationArray[0] !== PERSONALITY_PAGE)) {
            console.error("Invalid URL structure: URL must start with 'chatbots-select-personality-page' or 'personality'");
            return;
        }

        const webComponentName = locationArray[locationArray.length - 1];
        const pageUrl = `${webSkel.currentUser.space.id}/${appName}/${locationArray.join("/")}`;
        await webSkel.changeToDynamicPage(webComponentName, pageUrl);
    }
}