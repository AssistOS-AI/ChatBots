export function parseURL() {
    let url = window.location.hash.split('/');
    let personalityId = url[3];
    return personalityId;
}
export function getAppName(){
    let url = window.location.hash.split('/');
    return url[1];
}
export function getBasePath(){
    return `${assistOS.space.id}`+`/`+`${getAppName()}`;
}