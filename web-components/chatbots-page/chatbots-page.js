export class chatbotsPage {
    constructor(element,invalidate) {
        this.element = element;
        this.invalidate=invalidate;
        this.invalidate();
        this.personalityId = webSkel.getService("UtilsService").parseURL();
        let appName = window.location.hash.split('/')[1];
        this.appManager = webSkel.initialisedApplications[appName].manager;
        this.cachedHistory = [];
        this.incognito = false;
        this.incognitoConversation = {history:[],currentEmotion:{name:". . .",emoji:"&#128578;"}};
    }
    beforeRender() {
        this.chatbot = this.appManager.getChatbot(this.personalityId);
        if(this.incognito){
            this.buildCurrentConversation(this.incognitoConversation);
        }else {
            this.conversation =  this.appManager.services.get("ChatbotService").initChatbot(this.appManager, this.personalityId);
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
        for(let conversation of this.chatbot.conversations){
            if(conversation.id !== currentConversationId){
                let preview;
                if(conversation.history[0]){
                    preview = conversation.history[0].content;
                }else {
                    preview = "New chat"
                }
                string += `
                <div class="conversation-unit" data-local-action="setCurrentConversation" data-id="${conversation.id}">
                    <div>${preview}</div>
                    <div>${conversation.creationDate}</div>
                </div>`
            }
        }
        this.otherConversations = string;
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
    async summarizeConversation(){
        let count = 0;
        for(let reply of this.history){
            count+= reply.content.length;
        }
        if(count < 500){
            return;
        }
      let flowId = webSkel.currentUser.space.getFlowIdByName("SummarizeConversation");
      let response = await webSkel.getService("LlmsService").callFlow(flowId, JSON.stringify(this.history));
      this.history = [];
      this.history.push(response.responseJson.summary[0]);
      this.history.push(response.responseJson.summary[1]);
    }
    async sendMessage(_target){
        let formInfo = await webSkel.UtilsService.extractFormInformation(_target);
        let input = formInfo.data.input;
        formInfo.elements.input.element.value = "";
        this.conversation.setCurrentEmotion(this.defaultEmotion);
        this.chatbot.addMessage(this.conversation, "user", input);
        this.displayEmotion(this.defaultEmotion);
        this.displayMessage("user",input);
        let flowId = webSkel.currentUser.space.getFlowIdByName("Chatbots");
        //await this.summarizeConversation();
        let response = await webSkel.getService("LlmsService").callFlow(flowId, this.chatbot, this.conversation, formInfo.data.input, this.personalityId, this.conversation.history);

        if(!response.responseJson){
            response.responseJson = {
                reply:"I'm sorry, I didn't understand what you said. Please repeat.",
                emotion:{name:"Confused",emoji:"&#128533;"}
            };
        }
        this.conversation.setCurrentEmotion(response.responseJson.emotion);
        this.chatbot.addMessage(this.conversation, "assistant", response.responseJson.reply);
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
    }

    setCurrentConversation(_target){
        this.chatbot.currentConversationId = _target.getAttribute("data-id");
        this.invalidate();
    }
    createIncognitoConversation(){
        this.incognito = true;
        this.invalidate();
    }
}