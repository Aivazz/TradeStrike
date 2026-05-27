let currentUser = null;
let activeAuthMode = 'login';

async function initializeAuth() {
    document.getElementById('app-shell').style.display = 'none';

    const token = localStorage.getItem('authToken');
    if (!token) {
        renderAuthScreen();
        return;
    }

    try {
        const response = await getCurrentUser();
        currentUser = response.data;
        showDashboard();
    } catch {
        localStorage.removeItem('authToken');
        renderAuthScreen();
    }
}

function renderAuthScreen(mode = activeAuthMode) {
    activeAuthMode = mode;
    document.getElementById('app-shell').style.display = 'none';
    const isLogin = activeAuthMode === 'login';

    document.getElementById('auth-root').innerHTML = `
        <main class="auth-screen">
            <section class="auth-panel">
                <div class="auth-brand">
                    <span class="logo-primary">TradeStrike</span>
                </div>
                <div class="auth-tabs">
                    <button class="${isLogin ? 'active' : ''}" onclick="renderAuthScreen('login')">Giriş Yap</button>
                    <button class="${!isLogin ? 'active' : ''}" onclick="renderAuthScreen('register')">Kayıt Ol</button>
                </div>
                <form class="auth-form" onsubmit="${isLogin ? 'handleLoginSubmit(event)' : 'handleRegisterSubmit(event)'}">
                    ${isLogin ? renderLoginFields() : renderRegisterFields()}
                    <button class="auth-submit" type="submit">${isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}</button>
                </form>
                <div class="demo-users">
                    <strong>Demo Kullanıcıları</strong>
                    <span>trader / trader123</span>
                    <span>admin / admin123</span>
                </div>
            </section>
        </main>
    `;
}

function renderLoginFields() {
    return `
        <label>
            <span>Kullanıcı Adı</span>
            <input name="username" autocomplete="username" required>
        </label>
        <label>
            <span>Şifre</span>
            <input name="password" type="password" autocomplete="current-password" required>
        </label>
    `;
}

function renderRegisterFields() {
    return `
        <label>
            <span>Görünen İsim</span>
            <input name="displayName" autocomplete="name" required>
        </label>
        <label>
            <span>E-posta</span>
            <input name="email" type="email" autocomplete="email" required>
        </label>
        <label>
            <span>Kullanıcı Adı</span>
            <input name="username" autocomplete="username" required>
        </label>
        <label>
            <span>Şifre</span>
            <input name="password" type="password" autocomplete="new-password" minlength="6" required>
        </label>
    `;
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');

    await submitAuth(button, async () => {
        const response = await loginUser(form.username.value.trim(), form.password.value);
        completeAuth(response.data);
    });
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');

    await submitAuth(button, async () => {
        const response = await registerUser({
            displayName: form.displayName.value.trim(),
            email: form.email.value.trim(),
            username: form.username.value.trim(),
            password: form.password.value
        });
        completeAuth(response.data);
    });
}

async function submitAuth(button, action) {
    const previousText = button.textContent;
    button.disabled = true;
    button.textContent = 'Lütfen bekleyin...';

    try {
        await action();
    } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = previousText;
    }
}

function completeAuth(data) {
    localStorage.setItem('authToken', data.token);
    currentUser = data.user;
    showDashboard();
}

function showDashboard() {
    document.getElementById('auth-root').innerHTML = '';
    document.getElementById('app-shell').style.display = 'flex';
    renderSidebar();
    renderTopbar('Pazaryeri');
    renderMarketplaceView();
}

async function handleLogout() {
    try {
        await logoutUser();
    } catch {
        // Local logout still wins if the temporary in-memory server lost the session.
    }

    localStorage.removeItem('authToken');
    currentUser = null;
    renderAuthScreen('login');
}
