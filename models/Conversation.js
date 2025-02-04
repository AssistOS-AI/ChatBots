export class Conversation{
    constructor(conversationData) {
        this.id = conversationData.id || assistOS.services.generateId();
        this.history = conversationData.history || [];
        this.context = conversationData.context || [];
        this.wordCount = conversationData.wordCount || 0;
        this.currentEmotion = conversationData.currentEmotion || {name:". . .", emoji:"&#128578;"};
        this.lastInteraction = conversationData.lastInteraction || new Date();
        this.creationDate = conversationData.creationDate || new Date();
        this.isInstructed = conversationData.isInstructed;
    }

    async addMessage(role, content){
        if(role === "system" && !this.isInstructed){
            this.isInstructed = true;
        }
        if(!["assistant","user","system"].includes(role)){
            console.error(`Chatbot history: role must be either assistant, user or assistOS. Message: ${content}`);
        }
        let words = content.split(" ");
        this.wordCount += words.length;
        this.history.push({role:role,content:content});
    }

    async resetConversation(){
        this.history = [];
        this.wordCount = 0;
        this.context= [];
        await assistOS.storage.storeObject(assistOS.space.id, "status", "status", JSON.stringify(assistOS.space.getSpaceStatus(),null,2));
    }

    async addContext(context){
        this.context.push({role:"system", content: context});
    }
    getContext(){
        if(this.context.length > 1){
            return this.context;
        }else {
            return this.history;
        }
    }

     setCurrentEmotion(currentEmotion){
        this.currentEmotion = currentEmotion;
    }
    setLastInteraction(){
        this.lastInteraction = new Date();
    }
}