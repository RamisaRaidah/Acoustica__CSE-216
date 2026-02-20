export function enterAuthMode() {
    const app = document.getElementById('app');
    const content = document.getElementById('content');

    document.body.style.cssText = 'margin: 0 !important; padding: 0 !important; overflow-x: hidden;';
    document.documentElement.style.cssText = 'margin: 0 !important; padding: 0 !important; overflow-x: hidden;';
    
    app.style.cssText = 'display: contents !important;';
    content.style.cssText = `
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 100vh;
        background: transparent !important;
    `;
    content.style.cssText = `
        display: block !important;
        position: relative !important;
        top: unset !important;
        left: unset !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 100vh;
        background: transparent !important;
    `;
}
export function exitAuthMode() {
    const app = document.getElementById('app');
    const content = document.getElementById('content');
    content.style.position = '';
    content.style.top = '';
    content.style.left = '';
    content.style.height = '';

    app.style.display = '';
    app.style.minHeight = '';
    content.style.margin = '';
    content.style.padding = '';
    content.style.width = '';
    content.style.maxWidth = '';
    document.body.style.backgroundColor = '';
    document.body.style.overflow = '';
}