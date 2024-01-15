export class Conversation{
    constructor(conversationData) {
        this.id = conversationData.id || webSkel.getService("UtilsService").generateId();
        this.history = conversationData.history || [];
        this.context = conversationData.context || [];
        this.wordCount = conversationData.wordCount || 0;
        this.currentEmotion = conversationData.currentEmotion || {name:". . .", emoji:"&#128578;"};
        this.lastInteraction = conversationData.lastInteraction || new Date();
        this.creationDate = conversationData.creationDate || new Date();
    }

    async addMessage(role, content){
        if(!["assistant","user","system"].includes(role)){
            console.error(`Chatbot history: role must be either assistant, user or system. Message: ${content}`);
        }
        let words = content.split(" ");
        this.wordCount += words.length;
        this.history.push({role:role,content:content});
    }

    async resetConversation(){
        this.history = [];
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
    getContext(){
        if(this.context.length > 0){
            return this.context;
        }else {
            return this.conversationHistory;
        }
    }

     setCurrentEmotion(currentEmotion){
        this.currentEmotion = currentEmotion;
    }
    setLastInteraction(){
        this.lastInteraction = new Date();
    }
}