export function parseURL() {
    let url = window.location.hash.split('/');
    let personalityId = url[3];
    return personalityId;
}
export function getAppName(){
    return 'ChatBots';
}
export function getBasePath(){
    return `${webSkel.currentUser.space.id}`+`/`+`${getAppName()}`;
}