
export class chatbotsPage {
    constructor(element,invalidate) {
        this.element = element;
        this.invalidate=invalidate;
        this.invalidate();
        this.personalityId = webSkel.getService("UtilsService").parseURL();
        this.cachedHistory = [];
        // this.history = [
        // {role: 'user', content: 'hello'},
        // {role: 'assistant', content: 'Hello! How can I assist you today?'},
        // {role: 'user', content: 'do you know the band tool?'},
        // {role: 'assistant', content: 'Yes, I am familiar with the band Tool. They are a …r your thoughts and experiences with their music!'}];
        // this.cachedHistory = this.history;
        // this.cachedEmotion = {name:"Excitement",emoji:"🎉"}
        this.history = [];
        this.defaultEmotion = {name:". . .",emoji:"&#128578;"}
        this.storedEmotion = null || this.defaultEmotion;

    }
    beforeRender() {
        let stringHTML = "";
        for(let reply of this.cachedHistory){
            if(reply.role === "user"){
                stringHTML += `
                <div class="chat-box-container user">
                 <div class="chat-box user-box">${reply.content}</div>
                </div>`;
            }else {
                stringHTML += `
                <div class="chat-box-container robot">
                 <div class="chat-box robot-box">${reply.content}</div>
                </div>`;
            }
        }
        this.conversationHistory = stringHTML;
        this.savedEmotion = `
             <div class="emotion-emoticon">${this.storedEmotion.emoji}</div>
             <div class="emotion-name">${this.storedEmotion.name}</div>`;
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
        this.conversation = this.element.querySelector(".conversation");
        this.emotionContainer = this.element.querySelector(".emotion");
        this.userInput = this.element.querySelector("#input");
        this.userInput.removeEventListener("keypress", this.boundFn);
        this.boundFn = this.preventRefreshOnEnter.bind(this);
        this.userInput.addEventListener("keypress", this.boundFn);
    }
    displayMessage(role, text){
        let reply;
        this.cachedHistory.push({role:role,content: text})
        if(role === "user"){
            reply = `
                <div class="chat-box-container user">
                 <div class="chat-box user-box">${text}</div>
                </div>`;

        }else {
            reply = `
                <div class="chat-box-container robot">
                 <div class="chat-box robot-box">${text}</div>
                </div>`;
        }
        this.conversation.insertAdjacentHTML("beforeend", reply);
        const lastReplyElement = this.conversation.lastElementChild;
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
        this.displayMessage("user",input);
        this.displayEmotion(this.defaultEmotion);
        let flowId = webSkel.currentUser.space.getFlowIdByName("Chatbots");
        await this.summarizeConversation();
        let response = await webSkel.getService("LlmsService").callFlow(flowId, formInfo.data.input, this.personalityId, this.history);

        this.history.push({role:"user",content:input});
        if(!response.responseJson){
            response.responseJson = {
                reply:"I'm sorry, I didn't understand what you said. Please repeat.",
                emotion:{name:"Confused",emoji:"&#128533;"}
            };
        }
        this.history.push({role:"assistant",content:response.responseJson.reply});
        this.displayMessage("assistant", response.responseJson.reply);
        this.displayEmotion(response.responseJson.emotion);
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
}