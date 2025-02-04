import {RoutingService} from "./services/RoutingService.js";
import {ChatbotService} from "./services/ChatbotService.js";
import {Chatbot} from "./models/Chatbot.js";

const applicationModule= require("assistos").loadModule("application");

export class Manager {
    constructor(appName) {
        this.app = assistOS.space.getApplicationByName(appName);
        this.services = new Map();
        this.services.set('RoutingService', new RoutingService());
        this.services.set('ChatbotService', new ChatbotService());
    }
    async navigateToLocation(location) {
        this.services.get('RoutingService').navigateToLocation(location, this.app.name);
    }
    async loadAppData(){
        let bots = JSON.parse(await applicationModule.loadAppObjects(this.app.name, "data"));
        this.app.bots = [];
        for(let botData of bots){
            this.app.bots.push(new Chatbot(botData));
        }
    }
    getChatbot(personalityId){
        let chatbot = this.app.bots.find((bot) => bot.personalityId === personalityId);
        return chatbot || console.error(`Chatbot not found, personalityId: ${personalityId}`);
    }
}
