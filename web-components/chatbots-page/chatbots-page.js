export class chatbotsPage {
    constructor(element,invalidate) {
        this.element = element;
        this.invalidate=invalidate;
        this.invalidate();
        this.personalityId = webSkel.getService("UtilsService").parseURL();
        let appName = window.location.hash.split('/')[1];
        this.appManager = webSkel.initialisedApplications[appName].manager;
        this.incognito = false;
        this.incognitoConversation = {history:[],currentEmotion:{name:". . .",emoji:"&#128578;"}};
        this.defaultEmotion = {name:". . .",emoji:"&#128578;"};
    }
    beforeRender() {
        this.conversation =  this.appManager.services.get("ChatbotService").initChatbot(this.appManager, this.personalityId);
        this.chatbot = this.appManager.getChatbot(this.personalityId);
        if(this.incognito){
            this.buildCurrentConversation(this.incognitoConversation);
        }else {
            this.buildCurrentConversation(this.conversation);
        }
        this.buildConversationUnits();
    }

    buildCurrentConversation(conversation){
        let stringHTML = "";
        for(let reply of conversation.history){
            if(reply.role === "user"){
                stringHTML += `
                <div class="chat-box-container user">
                 <div class="chat-box user-box">${reply.content}</div>
                </div>`;
            }else if(reply.role === "assistant"){
                stringHTML += `
                <div class="chat-box-container robot">
                 <div class="chat-box robot-box">${reply.content}</div>
                </div>`;
            }
        }
        this.conversationHistory = stringHTML;
        this.savedEmotion = `
             <div class="emotion-emoticon">${conversation.currentEmotion.emoji}</div>
             <div class="emotion-name">${conversation.currentEmotion.name}</div>`;
    }
    buildConversationUnits(){
        let string = "";
        let currentConversationId;
        if(!this.incognito){
            currentConversationId = this.conversation.id;
        }
        let conversationPreviews = this.chatbot.conversations
            .filter((conv) => conv.id !== currentConversationId)
            .map((conv) => {
                let preview;
                if (conv.history[1]) {
                    preview = conv.history[1].content;
                } else {
                    preview = "New chat";
                }
                return { preview: preview, date: conv.creationDate, id: conv.id };
            });

        const cat1 = "Today", cat2 = "Yesterday", cat3 =
                "Last week", cat4 = "Last month", cat5 = "A year ago", cat6 = "2 years ago", cat7 = "More than 3 years ago";
            let categories = {
            [cat1]: [],
            [cat2]: [],
            [cat3]: [],
            [cat4]: [],
            [cat5]: [],
            [cat6]: [],
            [cat7]: [],
        }
        for(let convo of conversationPreviews){
            const today = new Date();
            const eventDate = new Date(convo.date);

            const timeDiff = today - eventDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const yearsDiff = Math.floor(daysDiff / 365);

            if (daysDiff === 0) {
                categories[cat1].push(convo);
            } else if (daysDiff === 1) {
                categories[cat2].push(convo);
            } else if (daysDiff <= 7) {
                categories[cat3].push(convo);
            } else if (daysDiff <= 30) {
                categories[cat4].push(convo);
            } else if (yearsDiff === 1) {
                categories[cat5].push(convo);
            } else if (yearsDiff === 2) {
                categories[cat6].push(convo);
            } else {
                categories[cat7].push(convo);
            }
        }
        for(let [category, conversations] of Object.entries(categories)){
            if(categories[category].length !== 0){
                string += `
                <div>
                     <div class="creation-date">${category}</div>
                     ${this.createPreviews(conversations)}
                </div>`;
            }
        }
        this.otherConversations = string;
    }
    createPreviews(conversations){
        let string = "";
        for(let convo of conversations){
            string += `
                <div class="conversation-unit" data-local-action="setCurrentConversation" data-id="${convo.id}">
                     ${convo.preview}
                </div>`;
        }
        return string;
    }
    preventRefreshOnEnter(event){
      if(event.key === "Enter" && !event.ctrlKey){
          event.preventDefault();
          this.element.querySelector(".send-message-btn").click();
      }
      if(event.key === "Enter" && event.ctrlKey){
          this.userInput.value += '\n';
      }
    }
    afterRender(){
        this.chatbox = this.element.querySelector(".conversation");
        this.emotionContainer = this.element.querySelector(".emotion");
        this.userInput = this.element.querySelector("#input");
        this.userInput.removeEventListener("keypress", this.boundFn);
        this.boundFn = this.preventRefreshOnEnter.bind(this);
        this.userInput.addEventListener("keypress", this.boundFn);
    }
    displayMessage(role, text){
        let reply;
        if(role === "user"){
            reply = `
                <div class="chat-box-container user">
                 <div class="chat-box user-box">${text}</div>
                </div>`;

        }else if(role === "assistant"){
            reply = `
                <div class="chat-box-container robot">
                 <div class="chat-box robot-box">${text}</div>
                </div>`;
        }
        this.chatbox.insertAdjacentHTML("beforeend", reply);
        const lastReplyElement = this.chatbox.lastElementChild;
        lastReplyElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }

    displayEmotion(currentEmotion){
        this.emotionContainer.classList.remove("fade-in");
        this.emotionContainer.classList.add("fade-out");
        setTimeout(()=>{
            this.emotionContainer.textContent = "";
            let emotion = `
         <div class="emotion-emoticon">${currentEmotion.emoji}</div>
         <div class="emotion-name">${currentEmotion.name}</div>`;
            this.emotionContainer.insertAdjacentHTML("beforeend", emotion);

            this.emotionContainer.classList.remove("fade-out");
            this.emotionContainer.classList.add("fade-in");
        },500);
    }

    async storeConversationData(role, text, emotion){
        if(this.incognito){
            this.incognitoConversation.history.push({role:role, content:text});
            this.incognitoConversation.currentEmotion = emotion;
        }
        else {
            this.conversation.setCurrentEmotion(emotion);
            await this.chatbot.addMessage(this.conversation, role, text);
        }
    }
    async sendMessage(_target){
        let formInfo = await webSkel.UtilsService.extractFormInformation(_target);
        let input = formInfo.data.input;
        formInfo.elements.input.element.value = "";

        this.displayEmotion(this.defaultEmotion);
        this.displayMessage("user",input);
        let flowId = webSkel.currentUser.space.getFlowIdByName("Chatbots");

        let response = await webSkel.getService("LlmsService").callFlow(flowId, this.chatbot, this.conversation, formInfo.data.input, this.defaultEmotion, this.personalityId, this.conversation.getContext());

        if(!response.responseJson){
            response.responseJson = {
                reply:"I'm sorry, I didn't understand what you said. Please repeat.",
                emotion:{name:"Confused",emoji:"&#128533;"}
            };
        }
        await this.storeConversationData("assistant", response.responseJson.reply, response.responseJson.emotion);
        await this.appManager.services.get("ChatbotService").summarizeConversation(this.chatbot, this.conversation);
        this.displayEmotion(response.responseJson.emotion);
        this.displayMessage("assistant", response.responseJson.reply);

    }

    showHistory(_target, mode){
        if(mode === "off"){
            let target = this.element.querySelector(".history");
            target.style.display = "block";
            let controller = new AbortController();
            document.addEventListener("click",this.hideHistory.bind(this,controller, _target), {signal:controller.signal});
            _target.setAttribute("data-local-action", "showHistory on");
        }
    }
    hideHistory(controller, arrow, event) {
        arrow.setAttribute("data-local-action", "showHistory off");
        let target = this.element.querySelector(".history");
        target.style.display = "none";
        controller.abort();
    };

    async createConversation(){
        this.chatbot.currentConversationId = await this.chatbot.addConversation();
        this.invalidate();
        this.incognito = false;
    }

    setCurrentConversation(_target){
        this.chatbot.currentConversationId = _target.getAttribute("data-id");
        this.invalidate();
        this.incognito = false;
    }
    createIncognitoConversation(){
        this.incognito = true;
        this.invalidate();
    }
}