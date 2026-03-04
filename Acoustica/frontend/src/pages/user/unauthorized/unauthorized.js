import { enterApp } from "/src/utils/helper.js";

export async function renderUnauthorized() {
    enterApp();
    const content = document.getElementById('content')
    content.innerHTML = `
        <h1>Unauthorized page</h1>
    `;
}