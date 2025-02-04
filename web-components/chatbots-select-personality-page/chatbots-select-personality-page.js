import {getBasePath} from "../../utils/index.js";

export class ChatbotsSelectPersonalityPage {
    constructor(element,invalidate) {
        this.element = element;
        this.invalidate=invalidate;
        this.invalidate();
    }
    beforeRender() {
        this.chatbotsBackground = `data-volume/spaces/${assistOS.space.id}/applications/ChatBots/assets/background.png`;
        this.personalityBlocks = "";
        if (assistOS.space.personalities.length > 0) {
            assistOS.space.personalities.forEach((item) => {
                this.personalityBlocks += `<personality-unit data-name="${item.name}" data-description="${item.description}" data-id="${item.id}" data-image="${item.image || "../../wallet/assets/images/default-personality.png"}"></personality-unit>`;
            });
        }else {
            this.personalityBlocks = `<div class="no-personality">No personality defined</div>`;
        }
    }

    async selectPersonality(_target){
        let personality = assistOS.UI.reverseQuerySelector(_target,"personality-unit");
        let personalityId = personality.getAttribute("data-id");
        await assistOS.UI.changeToDynamicPage("chatbots-page", `${getBasePath()}/chatbots-page/${personalityId}`);
    }
}