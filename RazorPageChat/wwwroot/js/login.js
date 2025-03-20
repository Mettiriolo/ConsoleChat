document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const errorMessage = document.getElementById('error-message');
    const demoAccountButton = document.getElementById('demo-account');

    // 如果有保存的用户名, 自动填充
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            if (userData.username && userData.rememberMe) {
                usernameInput.value = userData.username;
                rememberMeCheckbox.checked = true;
            }
        } catch (e) {
            console.error('Error parsing saved user:', e);
        }
    }

    // 登录按钮点击事件
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        login();
    });

    // 演示账号按钮点击事件
    demoAccountButton.addEventListener('click', function(e) {
        e.preventDefault();
        usernameInput.value = 'demo';
        passwordInput.value = 'demo';
        login();
    });

    // 输入字段回车事件
    usernameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            login();
        }
    });

    // 登录函数
    async function login() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;

        if (!username) {
            showError('请输入用户名');
            usernameInput.focus();
            return;
        }

        if (!password) {
            showError('请输入密码');
            passwordInput.focus();
            return;
        }

        // 显示加载状态
        loginButton.disabled = true;
        loginButton.textContent = '登录中...';
        
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    rememberMe
                })
            });

            if (response.ok) {
                const userData = await response.json();
                
                // 保存登录状态到localStorage
                localStorage.setItem('chatUser', JSON.stringify({
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    loggedIn: true,
                    rememberMe
                }));
                
                // 跳转到聊天页面
                window.location.href = '/';
            } else {
                const errorData = await response.text();
                showError(errorData || '登录失败，请检查用户名和密码');
                
                // 还原按钮状态
                loginButton.disabled = false;
                loginButton.textContent = '登录';
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('网络错误，请稍后重试');
            
            // 还原按钮状态
            loginButton.disabled = false;
            loginButton.textContent = '登录';
        }
    }

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // 5秒后自动隐藏错误信息
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}); 