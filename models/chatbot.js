import {Conversation} from "./conversation.js";

export class Chatbot{
    constructor(chatbotData) {
        this.openers = chatbotData.openers || [];
        this.conversations = (chatbotData.conversations || [{}]).map(conversationData => new Conversation(conversationData));
        this.personalityId = chatbotData.personalityId;
        this.name = webSkel.currentUser.space.getPersonality(this.personalityId).name;
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
    async addConversation(){
        let conversation = new Conversation({})
        this.conversations.push(conversation);
        await storageManager.storeAppObject(webSkel.currentApplicationName, "data", this.getFileName(), JSON.stringify(this));
        return conversation.id;
    }

    async createOpener(){
        let message = "Hello!";
        let flowId = webSkel.currentUser.space.getFlowIdByName("Chatbots");
        return await webSkel.getService("LlmsService").callFlow(flowId, message, this.personalityId, "");
    }

    async addMessage(conversation, role, text){
        conversation.setLastInteraction();
        conversation.addMessage(role, text);
        await storageManager.storeAppObject(webSkel.currentApplicationName, "data", this.getFileName(), JSON.stringify(this));
    }
}