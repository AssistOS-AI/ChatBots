import {Conversation} from "./Conversation.js";

export class Chatbot{
    constructor(chatbotData) {
        this.openers = chatbotData.openers || [];
        this.conversations = (chatbotData.conversations || [{}]).map(conversationData => new Conversation(conversationData));
        this.personalityId = chatbotData.personalityId;
        this.name = system.space.getPersonality(this.personalityId).name;
        this.currentConversationId = chatbotData.currentConversationId || "";
    }

    getFileName(){
        return this.name + "#" + this.personalityId;
    }
    async setOpeners(openers){
        this.openers = openers;
        await system.storage.storeObject(system.space.id, "status", "status", JSON.stringify(system.space.getSpaceStatus(),null,2));
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
    async addConversation(){
        let conversation = new Conversation({})
        this.conversations.push(conversation);
        await system.storage.storeAppObject(system.currentApplicationName, "data", this.getFileName(), JSON.stringify(this));
        return conversation.id;
    }
    //TBD
    async createOpener(){
        let message = "Hello!";
        let flowId = system.space.getFlowIdByName("Chatbots");
        return await system.services.callFlow(flowId, message, this.personalityId, "");
    }

    async addMessage(conversation, role, text){
        conversation.setLastInteraction();
        conversation.addMessage(role, text);
        await system.storage.storeAppObject(system.currentApplicationName, "data", this.getFileName(), JSON.stringify(this));
    }

    async addContext(conversation, context){
        conversation.addContext(context);
        await system.storage.storeAppObject(system.currentApplicationName, "data", this.getFileName(), JSON.stringify(this));
    }
}