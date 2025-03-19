document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-body');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeInput = document.getElementById('remember-me');
    const loginButton = document.getElementById('login-button');
    const demoAccountButton = document.getElementById('demo-account');
    const errorMessage = document.getElementById('error-message');
    
    // 检查是否有保存的登录信息
    checkSavedLogin();
    
    // 设置输入框焦点
    setTimeout(() => {
        usernameInput.focus();
    }, 500);
    
    // 登录按钮点击事件
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        login();
    });
    
    // 按回车键登录
    loginForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            login();
        }
    });
    
    // 使用演示账号登录
    demoAccountButton.addEventListener('click', function(e) {
        e.preventDefault();
        usernameInput.value = 'demo';
        passwordInput.value = 'demo123';
        rememberMeInput.checked = false;
        login();
    });
    
    // 检查是否有保存的登录信息
    function checkSavedLogin() {
        const savedUser = localStorage.getItem('chatUser');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                if (userData.rememberMe) {
                    usernameInput.value = userData.username || '';
                    rememberMeInput.checked = true;
                }
            } catch (e) {
                console.error('Error parsing saved login info:', e);
            }
        }
    }
    
    // 登录函数
    function login() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeInput.checked;
        
        // 验证输入
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
        
        // 在实际应用中，这里应该调用后端API进行用户验证
        // 由于这是前端演示，我们简单模拟一个验证过程
        
        // 这里简单验证，实际应用中应该通过API验证
        // 演示账号或任意非空用户名和密码都可以登录
        if (username === 'demo' && password === 'demo123' || (username && password)) {
            const userData = {
                username: username,
                loggedIn: true,
                rememberMe: rememberMe,
                loginTime: new Date().toISOString()
            };
            
            // 保存用户数据到localStorage
            localStorage.setItem('chatUser', JSON.stringify(userData));
            
            // 跳转到聊天页面
            window.location.href = '/';
        } else {
            showError('用户名或密码错误');
        }
    }
    
    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        
        // 3秒后隐藏错误信息
        setTimeout(() => {
            errorMessage.classList.remove('active');
        }, 3000);
    }
}); 