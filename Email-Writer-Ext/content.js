function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Gmail-style Blue Button */
        .ai-reply-button {
            background-color: #0b57d0 !important;
            color: white !important;
            border-radius: 18px !important;
            border: none !important;
            padding: 0 24px !important;
            height: 36px !important;
            font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-right: 8px !important;
            user-select: none !important;
            line-height: 1 !important;
            transition: box-shadow .08s linear, min-width .15s cubic-bezier(0.4,0.0,0.2,1) !important;
        }

        .ai-reply-button:hover {
            box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15) !important;
            background-color: #0842a0 !important;
        }

        .ai-reply-button[disabled] {
            background-color: #ccc !important;
            cursor: default !important;
            box-shadow: none !important;
        }

        /* Container for positioning the dropdown relative to the button */
        .ai-reply-container {
            position: relative;
            display: inline-flex;
            align-items: center;
        }

        /* Dropdown Menu */
        .ai-tone-popup {
            position: absolute;
            bottom: 40px; /* Positions menu above the button */
            left: 0;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            display: none; /* Hidden by default */
            flex-direction: column;
            min-width: 150px;
            padding: 8px 0;
        }

        .ai-tone-option {
            padding: 8px 16px;
            cursor: pointer;
            font-family: "Google Sans", Roboto, sans-serif;
            font-size: 14px;
            color: #3c4043;
            white-space: nowrap;
        }

        .ai-tone-option:hover {
            background-color: #f1f3f4;
            color: #202124;
        }
    `;
    document.head.appendChild(style);
}

// Execute the style injection immediately
injectStyles();
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
    // FIX: Changed 'V7' to 'v7' (lowercase v) to match Gmail styling
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.style.marginLeft = '8px'; // Add left margin for spacing from Send button
    button.innerText = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function createTonePopup(onSelect) {
    const popup = document.createElement('div');
    popup.className = 'ai-tone-popup';
    
    const tones = ['Professional', 'Casual', 'Friendly', 'Formal', 'Witty'];
    
    tones.forEach(tone => {
        const option = document.createElement('div');
        option.className = 'ai-tone-option';
        option.innerText = tone;
        option.onclick = (e) => {
            e.stopPropagation(); // Prevent bubbling
            onSelect(tone);
        };
        popup.appendChild(option);
    });
    
    return popup;
}

function injectButton() {
    // Remove existing container if any
    const existingContainer = document.querySelector('.ai-reply-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Compose toolbar not found");
        return;
    }

    console.log("Found compose toolbar, creating AI button");

    // Create a container to hold the button and the popup
    const container = document.createElement('div');
    container.className = 'ai-reply-container';

    const button = createAIButton();
    button.classList.add('ai-reply-button');

    // Function to handle API call with specific tone
    const generateReply = async (selectedTone) => {
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
                    tone: selectedTone
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
    };

    // Create the popup and handle selection
    const tonePopup = createTonePopup((tone) => {
        tonePopup.style.display = 'none'; // Hide popup
        generateReply(tone); // Generate with selected tone
    });

    // Toggle popup on button click
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        tonePopup.style.display = tonePopup.style.display === 'flex' ? 'none' : 'flex';
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            tonePopup.style.display = 'none';
        }
    });

    container.appendChild(button);
    container.appendChild(tonePopup);

    // FIX: Target the specific cell (.gU.Up) containing the Send button
    // This ensures the button appears beside "Send" instead of on a new line/outside.
    const sendButtonCell = toolbar.querySelector('.gU.Up');
    if (sendButtonCell) {
        sendButtonCell.appendChild(container);
    } else {
        // Fallback if specific cell isn't found
        toolbar.insertBefore(container, toolbar.firstChild);
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