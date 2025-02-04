export class ChatbotsPage {
    constructor(element,invalidate) {
        this.element = element;
        this.invalidate=invalidate;
        this.invalidate();
        this.personalityId = window.location.hash.split("/")[3];
        let appName = window.location.hash.split('/')[1];
        this.appManager = assistOS.initialisedApplications[appName].manager;
        this.incognito = false;
        this.incognitoConversation = {history:[],currentEmotion:{name:". . .",emoji:"&#128578;"}};
        this.defaultEmotion = {name:". . .",emoji:"&#128578;"};
    }
    beforeRender() {
        this.chatbotsBackground = `spaces/${assistOS.space.id}/applications/ChatBots/assets/background.png`;
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
                "Last week", cat4 = "Last month", cat5 = "Last year", cat6 = "Last 2 years", cat7 = "More than 3 years ago";
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

            if (daysDiff === 0) {
                categories[cat1].push(convo);
            } else if (daysDiff === 1) {
                categories[cat2].push(convo);
            } else if (daysDiff <= 7) {
                categories[cat3].push(convo);
            } else if (daysDiff <= 30) {
                categories[cat4].push(convo);
            } else if (daysDiff <= 365) {
                categories[cat5].push(convo);
            } else if (daysDiff <= 730) {
                categories[cat6].push(convo);
            } else {
                categories[cat7].push(convo);
            }
        }
        for(let [category, conversations] of Object.entries(categories)){
            if(categories[category].length !== 0){
                string += `
                <div class="category">
                    <div class="creation-date-container" data-local-action="toggleConversations">
                    <div class="creation-date">${category}</div>
                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.66031 1.65239L9.56245 1.42234C9.69146 1.36746 9.83014 1.33743 9.97065 1.33366C10.1112 1.32988 10.2513 1.35242 10.3832 1.40021C10.5151 1.44801 10.6366 1.5203 10.7404 1.61354C10.8443 1.7068 10.9286 1.81928 10.9878 1.94493L10.7617 2.05152L10.9878 1.94493C11.0471 2.07062 11.0799 2.20669 11.084 2.34528C11.0882 2.48388 11.0635 2.62162 11.0117 2.75049C10.96 2.87932 10.8824 2.99636 10.7841 3.09526C10.784 3.09527 10.784 3.09529 10.784 3.0953L4.41596 9.50014L10.783 15.9055C10.8829 16.0036 10.9621 16.1203 11.0154 16.2492C11.069 16.3786 11.0951 16.5174 11.0919 16.6572C11.0887 16.797 11.0562 16.9344 10.9969 17.0614C10.9376 17.1883 10.8527 17.3019 10.7479 17.3959C10.6431 17.4899 10.5204 17.5626 10.3872 17.6103C10.254 17.658 10.1125 17.68 9.97077 17.6752C9.82909 17.6705 9.68946 17.639 9.55994 17.5823C9.43095 17.5259 9.31417 17.4454 9.21666 17.3449L2.13457 10.2203L2.13447 10.2202L2.31177 10.044C2.16549 9.897 2.08398 9.7024 2.08398 9.50012C2.08398 9.29784 2.16549 9.10323 2.31177 8.95624L9.66031 1.65239ZM9.66031 1.65239L9.56245 1.42234C9.43342 1.47722 9.31621 1.55606 9.21786 1.65493L9.21781 1.65498L2.13457 8.77989M9.66031 1.65239L2.13457 8.77989M2.13457 8.77989C2.13454 8.77992 2.13451 8.77995 2.13448 8.77998L2.13457 8.77989Z" fill="#6F95B4" stroke="#6F95B4" stroke-width="0.5"/>
                    </svg>

                    </div>
                     <div class="conversation-units">${this.createPreviews(conversations)}</div>
                </div>`;
            }
        }
        this.otherConversations = string;
    }
    createPreviews(conversations){
        let string = "";
        for(let convo of conversations){
            string += `
                <div>
                     <div class="conversation-unit" data-local-action="setCurrentConversation" data-id="${convo.id}">${convo.preview}</div>
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
        let formInfo = await assistOS.UI.extractFormInformation(_target);
        let input = formInfo.data.input;
        formInfo.elements.input.element.value = "";

        this.displayEmotion(this.defaultEmotion);
        this.displayMessage("user",input);
        let response = await assistOS.callFlow("Chatbots", {
            chatbotObj:this.chatbot,
            conversation: this.conversation,
            userPrompt: formInfo.data.input,
            emotion: this.defaultEmotion,
            replyHistory: this.conversation.getContext()
        }, this.personalityId);

        if(!response){
            response = {
                reply:"I'm sorry, I didn't understand what you said. Please repeat.",
                emotion:{name:"Confused",emoji:"&#128533;"}
            };
        }
        await this.storeConversationData("assistant", response.reply, response.emotion);
        await this.appManager.services.get("ChatbotService").summarizeConversation(this.chatbot, this.conversation);
        this.displayEmotion(response.emotion);
        this.displayMessage("assistant", response.reply);

    }

    showHistory(_target, mode){
        if(mode === "off"){
            let target = this.element.querySelector(".history");
            target.style.display = "block";
            let controller = new AbortController();
            this.bindedHideHistory = this.hideHistory.bind(this, controller, _target);
            document.addEventListener("click", this.bindedHideHistory, {signal:controller.signal});
            _target.setAttribute("data-local-action", "showHistory on");
            let recentConversations = this.element.querySelector(".creation-date-container");
            if(recentConversations){
                recentConversations.click();
            }
            //else no other conversations
        }
    }
    hideHistory(controller, button, event) {
        let target = this.element.querySelector(".history");
        if(!target.contains(event.target)){
            button.setAttribute("data-local-action", "showHistory off");
            target.style.display = "none";
            controller.abort();
        }
    };

    async createConversation(){
        this.chatbot.currentConversationId = await this.chatbot.addConversation();
        this.invalidate();
        document.removeEventListener("click", this.bindedHideHistory);
        this.incognito = false;
    }

    setCurrentConversation(_target){
        this.chatbot.currentConversationId = _target.getAttribute("data-id");
        this.invalidate();
        document.removeEventListener("click", this.bindedHideHistory);
        this.incognito = false;
    }
    createIncognitoConversation(){
        this.incognito = true;
        this.invalidate();
        document.removeEventListener("click", this.bindedHideHistory);
    }

    toggleConversations(_target, mode){
        let parentTarget = assistOS.UI.getClosestParentElement(_target, ".category");
        let target = parentTarget.querySelector(".conversation-units");
        let arrow = parentTarget.querySelector("svg");
        let creationDateContainer = parentTarget.querySelector(".creation-date-container");
        let date = parentTarget.querySelector(".creation-date");
        if(mode === "on"){
            target.style.display = "none";
            creationDateContainer.setAttribute("data-local-action", "toggleConversations off");
            arrow.classList.remove("rotated");
            date.style.color = "var(--chatbots-history-blue)";
        }else {
            target.style.display = "block";
            creationDateContainer.setAttribute("data-local-action", "toggleConversations on");
            arrow.classList.add("rotated");
            date.style.color = "var(--bright-blue)";
        }
    }
}