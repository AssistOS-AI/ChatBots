import {getBasePath} from "../../utils/index.js";

export class chatbotsSelectPersonalityPage {
    constructor(element,invalidate) {
        let appName = window.location.hash.split('/')[1];
        this.appManager = webSkel.initialisedApplications[appName].manager;
        this.element = element;
        this.invalidate=invalidate;
        this.invalidate();
    }
    beforeRender() {
        this.personalityBlocks = "";
        if (webSkel.currentUser.space.personalities.length > 0) {
            webSkel.currentUser.space.personalities.forEach((item) => {
                this.personalityBlocks += `<personality-unit data-name="${item.name}" data-description="${item.description}" data-id="${item.id}" data-image="${item.image}"></personality-unit>`;
            });
        }else {
            this.personalityBlocks = `<div class="no-personality">No personality defined</div>`;
        }
    }

    async selectPersonality(_target){
        let personality = webSkel.UtilsService.reverseQuerySelector(_target,"personality-unit");
        let personalityId = personality.getAttribute("data-id");
        await webSkel.changeToDynamicPage("chatbots-page", `${getBasePath()}/personality/${personalityId}/chatbots-page`);
    }
}