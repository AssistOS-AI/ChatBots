export class ChatbotService {
    constructor() {
    }
    summarizeConversation(){

    }
     initChatbot(appManager, personalityId){
        let chatbot = appManager.app.bots.find(bot => bot.personalityId === personalityId);
        return chatbot.getCurrentConversation();
    }
}