import {Conversation} from "./conversation.js";

export class Chatbot{
    constructor(chatbotData) {
        this.openers = chatbotData.openers || [];
        this.name = chatbotData.name;
        this.conversations = chatbotData.conversations || [new Conversation()];
        this.personalityId = chatbotData.personalityId;
        this.currentConversationId = chatbotData.currentConversationId || "";
    }

    getFileName(){
        return this.name + "#" + this.personalityId;
    }
    async setOpeners(openers){
        this.openers = openers;
        await storageManager.storeObject(webSkel.currentUser.space.id, "status", "status", JSON.stringify(webSkel.currentUser.space.getSpaceStatus(),null,2));
    }
    getRandomOpener(){
        let random = Math.floor(Math.random() * this.openers.length);
        return this.openers[random];
    }
    getConversation(id){
        const conversation = this.conversations.find(conversation => conversation.id === id);
        return conversation || console.error(`chatbot conversation not found, id: ${id}`);
    }
    getCurrentConversation(){
        if(this.currentConversationId){
            return this.getConversation(this.currentConversationId);
        }else {
            this.currentConversationId = this.conversations[0].id;
            return this.conversations[0];
        }
    }
    async addConversation(appName){
        this.conversations.push(new Conversation());
        await storageManager.storeAppObject(appName, "data", this.getFileName(), JSON.stringify(this));
    }
    async addMessage(role, content){
        if(!["assistant","user","system"].includes(role)){
            console.error(`Chatbot history: role must be either assistant, user or system. Message: ${content}`);
        }
        let words = content.split(" ");
        this.wordCount += words.length;
        this.conversationHistory.push({role:role,content:content});
        await storageManager.storeObject(webSkel.currentUser.space.id, "status", "status", JSON.stringify(webSkel.currentUser.space.getSpaceStatus(),null,2));
    }

    async resetConversation(){
        this.conversationHistory = [];
        this.wordCount = 0;
        this.context= [];
        this.capabilities = [];
        await storageManager.storeObject(webSkel.currentUser.space.id, "status", "status", JSON.stringify(webSkel.currentUser.space.getSpaceStatus(),null,2));
    }

    async setContext(context){
        this.context[0] = {role:"system", content: context};
        let words = context.split(" ");
        this.wordCount = words.length;
        await storageManager.storeObject(webSkel.currentUser.space.id, "status", "status", JSON.stringify(webSkel.currentUser.space.getSpaceStatus(),null,2));
    }
    async createOpener(){
        let message = "Hello!";
        let flowId = webSkel.currentUser.space.getFlowIdByName("Chatbots");
        return await webSkel.getService("LlmsService").callFlow(flowId, message, this.personalityId, "");
    }
    getContext(){
        if(this.context.length > 0){
            return this.context;
        }else {
            return this.conversationHistory;
        }
    }
}