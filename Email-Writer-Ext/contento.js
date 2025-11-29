console.log("Content script loaded.");

function findComposeToolbar() {
    const selectors = [
        '.btC', // Prioritize the specific row containing the Send button
        '.aDh', 
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '[role="presentation"]',
        '.gmail_quote',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO V7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.style.marginLeft = '8px';
    button.innerText = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) {
        existingButton.remove();
    }

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Compose toolbar not found");
        return;
    }

    console.log("Found compose toolbar, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerText = 'Generating...';
            button.style.pointerEvents = 'none';

            const emailContent = getEmailContent();
            
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box not found');
            }
        } catch (error) {
            console.error('Failed to generate reply:', error);
            alert('Error generating AI reply: ' + error.message);
        } finally {
            button.innerText = 'AI Reply';
            button.style.pointerEvents = 'auto';
        }
    });

    // FIX: Target the specific cell (.gU.Up) containing the Send button
    // This ensures the button appears beside "Send" instead of on a new line/outside.
    const sendButtonCell = toolbar.querySelector('.gU.Up');
    if (sendButtonCell) {
        sendButtonCell.appendChild(button);
    } else {
        // Fallback if specific cell isn't found
        toolbar.insertBefore(button, toolbar.firstChild);
    }
}

   

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposedElement = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (
                node.matches('.aDh, .btC, [role="dialog"]') || 
                node.querySelector('.aDh, .btC, [role="dialog"]')
            )
        );

        if (hasComposedElement) {
            console.log("Detected addition of compose element");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});