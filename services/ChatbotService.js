import {Chatbot} from "../models/Chatbot.js";

export class ChatbotService {
    constructor() {
    }
    initChatbot(appManager, personalityId){
        let chatbot = appManager.app.bots.find(bot => bot.personalityId === personalityId);
        if(!chatbot){
            chatbot = new Chatbot({personalityId:personalityId});
            appManager.app.bots.push(chatbot);
            assistOS.storage.storeAppObject(appManager.app.name, "data", chatbot.getFileName(), JSON.stringify(chatbot));
        }
        return chatbot.getCurrentConversation();
    }

    async summarizeConversation(chatbot, conversation){
        if(conversation.wordCount < 2000){
            return;
        }
        let response = await assistOS.callFlow("SummarizeConversation", {
            replyHistory: conversation.getContext()
        });
        await chatbot.addContext(conversation, response);
        conversation.wordCount = 0;
        for(let reply of conversation.context){
            let words = reply.content.split(" ");
            conversation.wordCount += words.length;
        }
    }
}