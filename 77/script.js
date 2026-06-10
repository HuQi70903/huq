```javascript
// ⚠️ 重要：请将下面的YOUR_API_KEY替换为你的真实API Key
const API_KEY = 'sk-fb12884b6a86413d82c79d0b250a5acd';  // 在这里填入你的DeepSeek API Key
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

let conversationHistory = [];

// 发送消息
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // 显示用户消息
    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // 显示加载动画
    const loadingDiv = addMessage('思考中...', 'bot', true);
    
    try {
        const response = await callDeepSeekAPI(message);
        // 移除加载动画
        loadingDiv.remove();
        // 显示回复
        addMessage(response, 'bot');
    } catch (error) {
        loadingDiv.remove();
        addMessage('抱歉，请求出错了：' + error.message, 'bot');
        console.error('Error:', error);
    }
}

// 调用DeepSeek API
async function callDeepSeekAPI(userMessage) {
    // 构建消息历史
    const messages = [
        { role: 'system', content: '你是一个有帮助的AI助手。请用简洁清晰的中文回答。' },
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    
    // 更新对话历史
    conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
    );
    
    // 限制历史长度，避免token过多
    if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
    }
    
    return assistantMessage;
}

// 添加消息到聊天界面
function addMessage(text, sender, isLoading = false) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (isLoading) {
        messageDiv.innerHTML = '思考中<span class="loading"></span><span class="loading"></span><span class="loading"></span>';
    } else {
        // 支持简单的markdown格式
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\n/g, '<br>');
        messageDiv.innerHTML = text;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}

// 清空对话
function clearChat() {
    if (confirm('确定要清空所有对话吗？')) {
        conversationHistory = [];
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = `
            <div class="message bot-message">
                你好！我是DeepSeek助手，有什么可以帮助你的吗？
            </div>
        `;
    }
}

// 处理键盘事件
function handleKeyDown(event) {
    // Enter发送，Shift+Enter换行
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    
    // 自动调整文本框高度
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}
```
