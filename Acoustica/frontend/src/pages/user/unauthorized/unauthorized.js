export async function renderUnauthorized() {
    const content = document.getElementById('content')
    content.innerHTML = `
        <h1>Unauthorized page</h1>
    `;
}