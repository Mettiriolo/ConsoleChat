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
    const newChatButton = document.getElementById('new-chat');
    
    // 用户相关元素
    const usernameDisplay = document.getElementById('username-display');
    const userInitial = document.getElementById('user-initial');
    const logoutButton = document.getElementById('logout-button');
    
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
    logoutButton.addEventListener('click', function() {
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
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // 创建用户消息对象
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };
        
        // 添加消息到当前会话
        currentMessages.push(userMessage);
        
        // 添加用户消息到聊天界面
        addMessage(message, 'user');
        
        // 清空输入框并重置高度
        chatInput.value = '';
        chatInput.style.height = 'auto';
        updateSendButtonState();
        
        // 滚动到底部
        scrollToBottom();
        
        // 显示"正在输入"提示
        showTypingIndicator();
        
        // 保存会话到历史
        saveCurrentSession();
        
        // 模拟AI回复（在实际应用中，这里应该是API调用）
        simulateAIResponse();
    }

    // 模拟AI响应
    function simulateAIResponse() {
        // 计算基于消息长度的响应时间（使体验更真实）
        const responseTime = Math.random() * 1000 + 800; 
        
        setTimeout(() => {
            // 隐藏"正在输入"提示
            hideTypingIndicator();
            
            // 生成随机AI回复（仅作演示用）
            const responses = [
                "这是一个优化后的聊天界面演示。界面更加美观，交互更加流畅。",
                "你好！我是AI助手。这个界面现在支持更好的动画效果和响应式设计。",
                "看起来这个聊天界面现在更加现代化了。我喜欢这些细节上的改进。",
                "这些UI改进使得聊天体验更加愉快。你注意到那些平滑的动画效果了吗？"
            ];
            const aiResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // 创建AI消息对象
            const assistantMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            };
            
            // 添加消息到当前会话
            currentMessages.push(assistantMessage);
            
            // 添加AI回复到聊天界面
            addMessage(aiResponse, 'assistant');
            
            // 保存会话到历史
            saveCurrentSession();
            
            // 滚动到底部
            scrollToBottom();
            
            // 重新聚焦到输入框
            chatInput.focus();
        }, responseTime);
    }

    // 添加消息到聊天界面
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${sender}-avatar`;
        avatarDiv.innerText = sender === 'user' ? (currentUser ? currentUser.username.charAt(0).toUpperCase() : 'U') : 'A';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerText = content;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // 使用setTimeout创建更流畅的动画效果
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
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
    configButton.addEventListener('click', function() {
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
    
    // 保存配置
    saveConfig.addEventListener('click', function() {
        saveConfiguration();
        closeConfigPanel();
        
        // 显示配置已保存的提示
        showNotification('配置已保存');
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
    
    // 保存配置
    function saveConfiguration() {
        apiConfig.apiKey = apiKeyInput.value.trim();
        apiConfig.endpoint = endpointInput.value.trim() || 'https://api.deepseek.com/v1/chat/completions';
        apiConfig.modelId = modelIdInput.value.trim() || 'deepseek-chat';
        
        // 保存到localStorage (保存到当前用户的命名空间)
        const configKey = `chatApiConfig_${currentUser ? currentUser.username : 'default'}`;
        localStorage.setItem(configKey, JSON.stringify(apiConfig));
    }
    
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
    
    // 历史会话相关功能
    
    // 打开历史会话面板
    historyButton.addEventListener('click', function() {
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
    
    // 创建新会话
    newChatButton.addEventListener('click', function() {
        createNewSession();
    });
    
    // 打开历史会话面板
    function openHistoryPanel() {
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
        
        // 添加欢迎消息
        const welcomeMessage = {
            role: 'assistant',
            content: '你好！我是基于deepseek-chat的AI助手。有什么我可以帮助你的吗？',
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
                }
            } catch (e) {
                console.error('Error parsing chat history:', e);
                chatHistory = [];
            }
        } else {
            // 如果没有历史会话，则添加欢迎消息
            const welcomeMessage = {
                role: 'assistant',
                content: '你好！我是基于deepseek-chat的AI助手。有什么我可以帮助你的吗？',
                timestamp: new Date().toISOString()
            };
            
            currentMessages.push(welcomeMessage);
            
            // 添加欢迎消息到聊天界面
            addMessage(welcomeMessage.content, 'assistant');
        }
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
            }, 300);
        }, 3000);
    }
}); 