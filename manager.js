import {routingService} from "./services/routingService.js";
import {ChatbotService} from "./services/chatbotService.js";
import {Chatbot} from "./models/chatbot.js";
import {Conversation} from "./models/conversation.js";

export class Manager {
    constructor(appName) {
        this.app = webSkel.currentUser.space.getApplicationByName(appName);
        this.services = new Map();
        this.services.set('routingService', new routingService());
        this.services.set('HistoryService', new ChatbotService());
    }
    async navigateToLocation(location) {
        this.services.get('routingService').navigateToLocation(location, this.app.name);
    }
    async loadAppData(){
        let bots = JSON.parse(await storageManager.loadAppObjects(this.app.name, "data"));
        this.app.bots = [];
        for(let botData of bots){
            this.app.bots.push(new Chatbot(botData));
        }
    }
}