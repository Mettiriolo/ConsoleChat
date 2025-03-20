document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    checkUserLogin();
    
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    // 配置相关元素
    const configButton = document.getElementById('config-button');
    const configPanel = document.getElementById('config-panel');
    const closeConfig = document.getElementById('close-config');
    const saveConfig = document.getElementById('save-config');
    const overlay = document.getElementById('overlay');
    const apiKeyInput = document.getElementById('api-key');
    const endpointInput = document.getElementById('endpoint');
    const modelIdInput = document.getElementById('model-id');
    
    // 历史会话相关元素
    const historyButton = document.getElementById('history-button');
    const historyPanel = document.getElementById('history-panel');
    const closeHistory = document.getElementById('close-history');
    const historyList = document.getElementById('history-list');
    const searchHistory = document.getElementById('search-history');
    
    // 用户相关元素
    const usernameDisplay = document.getElementById('username-display');
    const userInitial = document.getElementById('user-initial');
    const logoutButton = document.getElementById('logout-button');
    
    // 更多菜单相关元素
    const moreButton = document.getElementById('more-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const newChatHeaderButton = document.getElementById('new-chat-header');
    
    // 当前用户数据
    let currentUser = null;
    
    // 配置默认值
    let apiConfig = {
        apiKey: '',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        modelId: 'deepseek-chat'
    };
    
    // 聊天历史数组
    let chatHistory = [];
    
    // 当前会话ID
    let currentSessionId = generateSessionId();
    
    // 当前会话消息
    let currentMessages = [];
    
    // 初始化页面
    initChat();
    
    // 从localStorage加载配置、用户数据和历史
    loadUserData();
    loadConfig();
    loadChatHistory();
    
    // 更多菜单按钮点击事件
    moreButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdownMenu();
    });
    
    // 点击页面其他地方关闭菜单
    document.addEventListener('click', function() {
        closeDropdownMenu();
    });
    
    // 顶部新会话按钮点击事件
    if (newChatHeaderButton) {
        newChatHeaderButton.addEventListener('click', function() {
            createNewSession();
        });
    }
    
    // 切换下拉菜单状态
    function toggleDropdownMenu() {
        if (dropdownMenu.classList.contains('active')) {
            closeDropdownMenu();
        } else {
            openDropdownMenu();
        }
    }
    
    // 打开下拉菜单
    function openDropdownMenu() {
        dropdownMenu.classList.add('active');
    }
    
    // 关闭下拉菜单
    function closeDropdownMenu() {
        dropdownMenu.classList.remove('active');
    }
    
    // 检查用户是否已登录
    function checkUserLogin() {
        const savedUser = localStorage.getItem('chatUser');
        
        if (!savedUser) {
            // 用户未登录，重定向到登录页面
            window.location.href = '/Login';
            return;
        }
        
        try {
            const userData = JSON.parse(savedUser);
            if (!userData.loggedIn) {
                // 用户未登录，重定向到登录页面
                window.location.href = '/Login';
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
            // 出错时重定向到登录页面
            window.location.href = '/Login';
        }
    }
    
    // 加载用户数据
    function loadUserData() {
        const savedUser = localStorage.getItem('chatUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                
                // 更新用户显示
                updateUserDisplay();
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }
    
    // 更新用户显示
    function updateUserDisplay() {
        if (currentUser && currentUser.username) {
            usernameDisplay.textContent = currentUser.username;
            userInitial.textContent = currentUser.username.charAt(0).toUpperCase();
        } else {
            usernameDisplay.textContent = '用户';
            userInitial.textContent = '?';
        }
    }
    
    // 登出按钮点击事件
    logoutButton.addEventListener('click', function(e) {
        e.stopPropagation();
        closeDropdownMenu();
        logout();
    });
    
    // 登出函数
    function logout() {
        // 如果启用了"记住我"，仅保留用户名
        if (currentUser && currentUser.rememberMe) {
            localStorage.setItem('chatUser', JSON.stringify({
                username: currentUser.username,
                loggedIn: false,
                rememberMe: true
            }));
        } else {
            // 否则清除所有用户数据
            localStorage.removeItem('chatUser');
        }
        
        // 重定向到登录页面
        window.location.href = '/Login';
    }
    
    function initChat() {
        // 设置输入框焦点
        setTimeout(() => {
            chatInput.focus();
        }, 500);
        
        // 滚动到底部
        scrollToBottom();
        
        // 初始化发送按钮状态
        updateSendButtonState();
    }

    // 自动调整输入框高度
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        
        // 更新发送按钮状态
        updateSendButtonState();
    });

    // 监听Enter发送消息
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim() !== '') {
                sendMessage();
            }
        } else if (e.key === 'Enter' && e.shiftKey) {
            // Shift+Enter 允许换行
        }
    });

    // 提交表单处理
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });

    // 更新发送按钮状态
    function updateSendButtonState() {
        if (chatInput.value.trim() === '') {
            sendButton.disabled = true;
            sendButton.classList.remove('active');
        } else {
            sendButton.disabled = false;
            sendButton.classList.add('active');
        }
    }

    // 发送消息函数
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // 添加用户消息到聊天界面
        addMessage(message, 'user');
        
        // 保存用户消息到内部历史
        currentMessages.push({
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString()
        });

        // 保存到服务器
        if (currentUser && currentUser.loggedIn) {
            saveMessageToServer({
                sessionId: currentSessionId,
                content: message,
                sender: 'user',
                username: currentUser.username
            });
        }

        // 清空输入框并重置高度
        chatInput.value = '';
        chatInput.style.height = 'auto';
        updateSendButtonState();
        
        // 滚动到底部
        scrollToBottom();

        // 发送消息到AI并获取回复
        await sendMessageToAI(message);
    }

    // 发送消息到AI并处理回复
    async function sendMessageToAI(userInput) {
        // 如果API配置不完整，显示错误
        if (!apiConfig.apiKey) {
            showErrorToast('请先设置API密钥');
            return;
        }

        // 准备消息历史记录
        const messageHistory = [];
        
        // 添加当前会话的历史记录
        for (const msg of currentMessages) {
            messageHistory.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        try {
            // 显示思考中状态
            const assistantMessage = addMessage('', 'assistant', true);
            
            // 调用后端API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messageHistory,
                    apiKey: apiConfig.apiKey,
                    endpoint: apiConfig.endpoint,
                    modelId: apiConfig.modelId
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    // 更新消息内容
                    updateMessage(assistantMessage, data.response);
                    
                    // 保存到数据库
                    saveMessageToServer({
                        sessionId: currentSessionId,
                        content: data.response,
                        sender: 'assistant',
                        username: currentUser ? currentUser.username : 'guest'
                    });
                    
                    // 更新内部消息历史
                    currentMessages.push({
                        content: data.response,
                        sender: 'assistant',
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // 处理错误
                    updateMessage(assistantMessage, '抱歉，发生了错误: ' + (data.error || '未知错误'));
                    console.error('AI响应错误:', data.error);
                }
            } else {
                const errorText = await response.text();
                updateMessage(assistantMessage, '抱歉，请求失败: ' + errorText);
                console.error('API请求失败:', response.status, errorText);
            }
        } catch (error) {
            console.error('发送消息异常:', error);
            showErrorToast('发送消息失败: ' + error.message);
        }
    }

    // 保存消息到服务器
    async function saveMessageToServer(message) {
        if (!currentUser || !currentUser.loggedIn) {
            // 离线模式，不保存到服务器
            return;
        }

        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                console.error('保存消息失败:', await response.text());
            }
        } catch (error) {
            console.error('保存消息异常:', error);
        }
    }

    // 添加流式消息元素到聊天界面（返回元素引用以便更新）
    function addStreamingMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${sender}-avatar`;
        avatarDiv.innerText = sender === 'user' ? (currentUser ? currentUser.username.charAt(0).toUpperCase() : 'U') : 'A';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content markdown-body';
        contentDiv.innerHTML = parseMarkdown(content);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // 使用setTimeout创建更流畅的动画效果
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
        
        return messageDiv;
    }

    // 更新流式消息内容
    function updateStreamingMessage(messageElement, content) {
        const contentDiv = messageElement.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.innerHTML = parseMarkdown(content);
        }
    }

    // 添加消息到聊天界面（更新为支持markdown）
    function addMessage(content, sender, isTypingIndicator = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${sender}-avatar`;
        avatarDiv.innerText = sender === 'user' ? (currentUser ? currentUser.username.charAt(0).toUpperCase() : 'U') : 'A';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content' + (sender === 'assistant' ? ' markdown-body' : '');
        
        // 根据发送者使用不同的内容处理
        if (sender === 'assistant') {
            contentDiv.innerHTML = parseMarkdown(content);
        } else {
            contentDiv.innerText = content;
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // 使用setTimeout创建更流畅的动画效果
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
        
        return messageDiv;
    }

    // 解析Markdown文本为HTML（使用简单的正则表达式实现，生产环境请考虑使用专业库）
    function parseMarkdown(text) {
        if (!text) return '';
        
        // 处理代码块 (```code```)
        text = text.replace(/```(\w*)([\s\S]*?)```/g, function(match, language, code) {
            return `<pre class="code-block${language ? ' language-'+language : ''}"><code>${escapeHTML(code.trim())}</code></pre>`;
        });
        
        // 处理内联代码 (`code`)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 处理加粗 (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体 (*text*)
        text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        
        // 处理标题 (# Title)
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        
        // 处理列表 (- item)
        text = text.replace(/^\- (.*$)/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        
        // 处理链接 ([text](url))
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 处理换行 (保留换行符)
        text = text.replace(/\n/g, '<br/>');
        
        return text;
    }

    // 转义HTML特殊字符，避免XSS攻击
    function escapeHTML(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // 保存配置
    saveConfig.addEventListener('click', function() {
        saveConfiguration();
        closeConfigPanel();
        
        // 显示配置已保存的提示
        showNotification('配置已保存');
    });

    // 加载配置
    function loadConfig() {
        // 从当前用户的命名空间加载配置
        const configKey = `chatApiConfig_${currentUser ? currentUser.username : 'default'}`;
        const savedConfig = localStorage.getItem(configKey);
        
        if (savedConfig) {
            try {
                apiConfig = JSON.parse(savedConfig);
            } catch (e) {
                console.error('Error parsing saved config:', e);
            }
        }
    }

    // 显示"正在输入"提示
    function showTypingIndicator() {
        if (document.getElementById('typing-indicator')) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.style.opacity = '0';
        
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            typingDiv.appendChild(span);
        }
        
        chatMessages.appendChild(typingDiv);
        
        // 淡入动画
        setTimeout(() => {
            typingDiv.style.transition = 'opacity 0.3s ease';
            typingDiv.style.opacity = '1';
        }, 10);
        
        scrollToBottom();
    }

    // 隐藏"正在输入"提示
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            // 淡出动画
            typingIndicator.style.opacity = '0';
            
            setTimeout(() => {
                typingIndicator.remove();
            }, 300);
        }
    }

    // 平滑滚动到底部
    function scrollToBottom() {
        const scrollHeight = chatMessages.scrollHeight;
        const currentScrollPosition = chatMessages.scrollTop + chatMessages.clientHeight;
        const difference = scrollHeight - currentScrollPosition;
        
        if (difference > 0) {
            // 使用平滑滚动
            chatMessages.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    // 添加窗口大小变化事件处理
    window.addEventListener('resize', function() {
        scrollToBottom();
    });
    
    // 配置面板相关功能
    
    // 打开配置面板
    configButton.addEventListener('click', function(e) {
        e.stopPropagation();
        closeDropdownMenu();
        openConfigPanel();
    });
    
    // 关闭配置面板
    closeConfig.addEventListener('click', function() {
        closeConfigPanel();
    });
    
    // 点击遮罩层关闭配置面板
    overlay.addEventListener('click', function() {
        closeConfigPanel();
        closeHistoryPanel();
    });
    
    // 打开配置面板
    function openConfigPanel() {
        // 填充当前配置到表单
        apiKeyInput.value = apiConfig.apiKey || '';
        endpointInput.value = apiConfig.endpoint || '';
        modelIdInput.value = apiConfig.modelId || '';
        
        configPanel.classList.add('active');
        overlay.classList.add('active');
        
        // 关闭历史面板（如果打开）
        closeHistoryPanel();
    }
    
    // 关闭配置面板
    function closeConfigPanel() {
        configPanel.classList.remove('active');
        if (!historyPanel.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    }
    
    // 历史会话相关功能
    
    // 打开历史会话面板
    historyButton.addEventListener('click', function(e) {
        e.stopPropagation();
        closeDropdownMenu();
        openHistoryPanel();
    });
    
    // 关闭历史会话面板
    closeHistory.addEventListener('click', function() {
        closeHistoryPanel();
    });
    
    // 搜索历史会话
    searchHistory.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        displayChatHistory(searchTerm);
    });
    
    // 打开历史会话面板
    function openHistoryPanel() {
        historyPanel.style.transform = 'translateX(0)';
        historyPanel.classList.add('active');
        overlay.classList.add('active');
        
        // 显示历史会话列表
        displayChatHistory();
        
        // 关闭配置面板（如果打开）
        closeConfigPanel();
    }
    
    // 关闭历史会话面板
    function closeHistoryPanel() {
        historyPanel.classList.remove('active');
        historyPanel.style.transform = 'translateX(-100%)';
        if (!configPanel.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    }
    
    // 生成会话ID
    function generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    // 创建新会话
    function createNewSession() {
        // 保存当前会话（如果有消息）
        if (currentMessages.length > 0) {
            saveCurrentSession();
        }
        
        // 创建新会话
        currentSessionId = generateSessionId();
        currentMessages = [];
        
        // 清空聊天界面
        chatMessages.innerHTML = '';
        
        // 添加欢迎消息，包含用户名
        const username = currentUser && currentUser.username ? currentUser.username : '您';
        const welcomeMessage = {
            role: 'assistant',
            content: `你好，${username}！我是基于deepseek-chat的AI助手。有什么我可以帮助你的吗？`,
            timestamp: new Date().toISOString()
        };
        
        // 添加欢迎消息到当前会话
        currentMessages.push(welcomeMessage);
        
        // 添加欢迎消息到聊天界面
        addMessage(welcomeMessage.content, 'assistant');
        
        // 保存会话
        saveCurrentSession();
        
        // 更新历史面板
        displayChatHistory();
        
        // 显示通知
        showNotification('已创建新会话');
    }
    
    // 保存当前会话
    function saveCurrentSession() {
        // 只保存有消息的会话
        if (currentMessages.length === 0) return;
        
        // 查找历史中是否已存在此会话
        const existingIndex = chatHistory.findIndex(session => session.id === currentSessionId);
        
        // 创建会话标题（使用第一条用户消息或默认值）
        const userMessages = currentMessages.filter(msg => msg.role === 'user');
        let sessionTitle = '新会话';
        if (userMessages.length > 0) {
            sessionTitle = userMessages[0].content.substring(0, 30) + (userMessages[0].content.length > 30 ? '...' : '');
        }
        
        const session = {
            id: currentSessionId,
            title: sessionTitle,
            lastUpdated: new Date().toISOString(),
            messages: currentMessages
        };
        
        if (existingIndex !== -1) {
            // 更新现有会话
            chatHistory[existingIndex] = session;
        } else {
            // 添加新会话
            chatHistory.push(session);
        }
        
        // 对会话进行排序（最新的在前面）
        chatHistory.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        
        // 保存到localStorage (保存到当前用户的命名空间)
        const historyKey = `chatHistory_${currentUser ? currentUser.username : 'default'}`;
        localStorage.setItem(historyKey, JSON.stringify(chatHistory));
        
        // 如果历史面板是打开的，则更新显示
        if (historyPanel.classList.contains('active')) {
            displayChatHistory();
        }
    }
    
    // 加载会话历史
    function loadChatHistory() {
        // 从当前用户的命名空间加载历史
        const historyKey = `chatHistory_${currentUser ? currentUser.username : 'default'}`;
        const savedHistory = localStorage.getItem(historyKey);
        
        if (savedHistory) {
            try {
                chatHistory = JSON.parse(savedHistory);
                
                // 如果有历史会话，加载最近的一个
                if (chatHistory.length > 0) {
                    loadSession(chatHistory[0].id);
                } else {
                    // 如果有历史记录键但为空，添加欢迎消息
                    addWelcomeMessage();
                }
            } catch (e) {
                console.error('Error parsing chat history:', e);
                chatHistory = [];
                // 添加欢迎消息
                addWelcomeMessage();
            }
        } else {
            // 如果没有历史会话，则添加欢迎消息
            addWelcomeMessage();
        }
    }
    
    // 添加欢迎消息
    function addWelcomeMessage() {
        // 获取用户名，如果存在
        const username = currentUser && currentUser.username ? currentUser.username : '您';
        
        const welcomeMessage = {
            role: 'assistant',
            content: `你好，${username}！我是基于deepseek-chat的AI助手。有什么我可以帮助你的吗？`,
            timestamp: new Date().toISOString()
        };
        
        currentMessages.push(welcomeMessage);
        
        // 添加欢迎消息到聊天界面
        addMessage(welcomeMessage.content, 'assistant');
    }
    
    // 显示历史会话列表
    function displayChatHistory(searchTerm = '') {
        // 清空历史列表
        historyList.innerHTML = '';
        
        if (chatHistory.length === 0) {
            // 显示空状态
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-history';
            emptyDiv.innerHTML = `
                <i class="fas fa-history"></i>
                <p>没有历史会话</p>
            `;
            historyList.appendChild(emptyDiv);
            return;
        }
        
        // 过滤会话
        let filteredHistory = chatHistory;
        if (searchTerm) {
            filteredHistory = chatHistory.filter(session => 
                session.title.toLowerCase().includes(searchTerm) || 
                session.messages.some(msg => msg.content.toLowerCase().includes(searchTerm))
            );
            
            if (filteredHistory.length === 0) {
                // 显示无搜索结果
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'empty-history';
                emptyDiv.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>没有找到匹配的会话</p>
                `;
                historyList.appendChild(emptyDiv);
                return;
            }
        }
        
        // 显示会话列表
        filteredHistory.forEach(session => {
            const item = document.createElement('div');
            item.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;
            item.setAttribute('data-id', session.id);
            
            // 找到最后一条AI消息作为预览
            const lastAiMessage = [...session.messages].reverse().find(msg => msg.role === 'assistant');
            const preview = lastAiMessage ? lastAiMessage.content : '没有回复';
            
            // 格式化日期
            const date = new Date(session.lastUpdated);
            const formattedDate = formatDate(date);
            
            item.innerHTML = `
                <div class="history-title">${session.title}</div>
                <div class="history-preview">${preview}</div>
                <div class="history-date">${formattedDate}</div>
            `;
            
            // 点击加载会话
            item.addEventListener('click', function() {
                const sessionId = this.getAttribute('data-id');
                loadSession(sessionId);
                closeHistoryPanel();
            });
            
            historyList.appendChild(item);
        });
    }
    
    // 加载指定会话
    function loadSession(sessionId) {
        // 保存当前会话
        if (currentMessages.length > 0) {
            saveCurrentSession();
        }
        
        // 查找会话
        const session = chatHistory.find(s => s.id === sessionId);
        if (!session) return;
        
        // 设置当前会话ID
        currentSessionId = session.id;
        
        // 设置当前消息
        currentMessages = JSON.parse(JSON.stringify(session.messages));
        
        // 清空聊天界面
        chatMessages.innerHTML = '';
        
        // 添加消息到界面
        session.messages.forEach(msg => {
            addMessage(msg.content, msg.role);
        });
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // 格式化日期
    function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        
        // 今天内
        if (diff < 24 * 60 * 60 * 1000 && 
            date.getDate() === now.getDate() && 
            date.getMonth() === now.getMonth() && 
            date.getFullYear() === now.getFullYear()) {
            return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // 昨天
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.getDate() === yesterday.getDate() && 
            date.getMonth() === yesterday.getMonth() && 
            date.getFullYear() === yesterday.getFullYear()) {
            return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // 一周内
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            return `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // 更早
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    
    // 显示通知
    function showNotification(message) {
        // 移除已存在的通知
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerText = message;
        
        // 添加到body
        document.body.appendChild(notification);
        
        // 淡入
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // 3秒后淡出
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 350); // 与动画持续时间匹配
        }, 3000);
    }

    // 添加触摸滑动关闭历史面板的功能
    if (historyPanel) {
        let startX = 0;
        let currentX = 0;
        
        historyPanel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        historyPanel.addEventListener('touchmove', function(e) {
            if (startX < 50) { // 只有从边缘开始滑动才处理
                currentX = e.touches[0].clientX;
                const translateX = currentX - startX;
                
                if (translateX < 0) return; // 只允许向右滑动关闭
                
                // 应用变换，跟随手指移动
                this.style.transform = `translateX(${translateX}px)`;
                this.style.transition = 'none';
                
                // 根据滑动距离调整背景透明度
                const opacity = 1 - (translateX / 200);
                overlay.style.opacity = opacity > 0 ? opacity : 0;
            }
        });
        
        historyPanel.addEventListener('touchend', function(e) {
            this.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            
            if (currentX - startX > 80) { // 如果滑动距离足够，关闭面板
                closeHistoryPanel();
            } else { // 否则回到原位
                this.style.transform = 'translateX(0)';
                overlay.style.opacity = '1';
            }
            
            startX = 0;
            currentX = 0;
        });
    }

    // 添加点击历史记录外部区域关闭面板的功能
    historyPanel.addEventListener('click', function(e) {
        e.stopPropagation(); // 防止点击面板内部时关闭
    });

    // 添加点击配置面板外部区域关闭面板的功能
    configPanel.addEventListener('click', function(e) {
        e.stopPropagation(); // 防止点击面板内部时关闭
    });
});