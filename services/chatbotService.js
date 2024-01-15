import {Chatbot} from "../models/chatbot.js";

export class ChatbotService {
    constructor() {
    }
    summarizeConversation(){

    }
     initChatbot(appManager, personalityId){
        let chatbot = appManager.app.bots.find(bot => bot.personalityId === personalityId);
        if(!chatbot){
            chatbot = new Chatbot({personalityId:personalityId});
            appManager.app.bots.push(chatbot);
            storageManager.storeAppObject(appManager.app.name, "data", chatbot.getFileName(), JSON.stringify(chatbot));
        }
        return chatbot.getCurrentConversation();
    }
}