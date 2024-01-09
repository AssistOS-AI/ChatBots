import {routingService} from "./services/routingService.js";

export class Manager {
    constructor() {
        this.appName = "ChatBots";
        this.services = new Map();
        this.services.set('routingService', new routingService());
    }
    async navigateToLocation(location) {
        this.services.get('routingService').navigateToLocation(location, this.appName);
    }
}