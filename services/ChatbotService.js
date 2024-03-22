import {Chatbot} from "../models/Chatbot.js";

export class ChatbotService {
    constructor() {
    }
    initChatbot(appManager, personalityId){
        let chatbot = appManager.app.bots.find(bot => bot.personalityId === personalityId);
        if(!chatbot){
            chatbot = new Chatbot({personalityId:personalityId});
            appManager.app.bots.push(chatbot);
            system.storage.storeAppObject(appManager.app.name, "data", chatbot.getFileName(), JSON.stringify(chatbot));
        }
        return chatbot.getCurrentConversation();
    }

    async summarizeConversation(chatbot, conversation){
        if(conversation.wordCount < 2000){
            return;
        }
        let flowId = system.space.getFlowIdByName("SummarizeConversation");
        let context = {
            replyHistory: conversation.getContext()
        }
        let response = await system.services.callFlow(flowId, context);
        await chatbot.addContext(conversation, response);
        conversation.wordCount = 0;
        for(let reply of conversation.context){
            let words = reply.content.split(" ");
            conversation.wordCount += words.length;
        }
    }
}