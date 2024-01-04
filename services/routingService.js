export class routingService {
    constructor() {
        this.appName = "ChatBots";
    }
    async navigateToLocation(locationArray) {
        if (locationArray[0] !== "chatbots-select-personality-page" && locationArray[0] !== "personality") {
            console.error("Invalid URL structure.");
            return;
        }
        const webComponentName = locationArray[locationArray.length - 1];
        const pageUrl = `${webSkel.currentUser.space.id}/${this.appName}/${locationArray.join("/")}`;
        await webSkel.changeToDynamicPage(webComponentName, pageUrl);
    }
}