export class Conversation{
    constructor(conversationData) {
        this.id = conversationData.id || webSkel.getService("UtilsService").generateId();
        this.history = conversationData.history || [];
        this.context = conversationData.context || [];
        this.wordCount = conversationData.wordCount || 0;
        this.currentEmotion = conversationData.currentEmotion || {name:". . .", emoji:"&#128578;"};
        this.lastInteraction = conversationData.lastInteraction || "";
    }
}