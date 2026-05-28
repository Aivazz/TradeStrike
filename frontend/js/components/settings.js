let settingsState = {
    fullName: '',
    email: '',
    avatar: '',
    isInventoryPrivate: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
};

function renderSettings() {
    // Sync state with current user
    const userObj = typeof currentUser !== 'undefined' ? currentUser : null;
    if (userObj) {
        if (!settingsState.fullName) {
            settingsState.fullName = userObj.displayName || userObj.username || '';
        }
        if (!settingsState.email) {
            settingsState.email = userObj.email || (userObj.username ? `${userObj.username}@tradestrike.dev` : 'traderpro@tradestrike.dev');
        }
        if (settingsState.isInventoryPrivate === undefined || settingsState.isInventoryPrivate === null) {
            settingsState.isInventoryPrivate = !!userObj.isInventoryPrivate;
        }
        settingsState.avatar = (userObj.displayName || userObj.username || 'TP').substring(0, 2).toUpperCase();
    }

    const settingsHTML = `
        <section class="settings-section">
            <div class="settings-shell" style="grid-template-columns: 1fr; max-width: 800px; margin: 0 auto;">
                <div class="settings-panel">
                    <!-- Раздел Профиль -->
                    <div class="settings-card" style="margin-bottom: 24px;">
                        <div class="settings-card-heading">
                            <div>
                                <h2>Profil</h2>
                                <p>Kişisel veriler, avatar ve ticaret bilgileri.</p>
                            </div>
                        </div>
                        <div class="profile-editor">
                            <div class="profile-avatar">${settingsState.avatar || 'TP'}</div>
                            <div class="settings-grid">
                                ${renderTextField('Ad Soyad', 'fullName', settingsState.fullName || '')}
                                ${renderTextField('E-posta', 'email', settingsState.email || '', 'email')}
                            </div>
                        </div>
                    </div>

                    <!-- Раздел Безопасность -->
                    <div class="settings-card" style="margin-bottom: 24px;">
                        <div class="settings-card-heading">
                            <div>
                                <h2>Güvenlik</h2>
                                <p>Şifreyi değiştirin ve hesaba erişimi koruyun.</p>
                            </div>
                        </div>
                        <div class="settings-grid security-grid">
                            ${renderTextField('Mevcut Şifre', 'currentPassword', settingsState.currentPassword || '', 'password')}
                            ${renderTextField('Yeni Şifre', 'newPassword', settingsState.newPassword || '', 'password')}
                            ${renderTextField('Şifreyi Onayla', 'confirmPassword', settingsState.confirmPassword || '', 'password')}
                        </div>
                    </div>

                    <!-- Gizlilik Ayarları (Privacy Settings) -->
                    <div class="settings-card" style="margin-bottom: 24px;">
                        <div class="settings-card-heading">
                            <div>
                                <h2>Gizlilik Ayarları</h2>
                                <p>Envanterinizin diğer kullanıcılar tarafından görülme durumunu kontrol edin.</p>
                            </div>
                        </div>
                        <div class="privacy-setting-row" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">
                            <div>
                                <strong style="color: var(--text-primary); font-size: 14px;">Gizli Envanter</strong>
                                <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">Aktif edildiğinde, diğer kullanıcılar envanterinizi görüntüleyemez.</p>
                            </div>
                            <label class="switch-toggle">
                                <input type="checkbox" id="privacy-inventory-toggle" ${settingsState.isInventoryPrivate ? 'checked' : ''} onchange="updatePrivacySetting(this.checked)">
                                <span class="slider-toggle"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Раздел Пополнение баланса -->
                    <div class="settings-card" style="margin-bottom: 24px;">
                        <div class="settings-card-heading">
                            <div>
                                <h2>Bakiye Yükle</h2>
                                <p>Hızlı yükleme için sabit bir miktar seçin veya kendi değerinizi girin.</p>
                            </div>
                        </div>
                        <div class="deposit-section-body">
                            <div class="deposit-presets">
                                <button class="btn-preset" onclick="selectDepositAmount(100)">+ 100 ₺</button>
                                <button class="btn-preset" onclick="selectDepositAmount(500)">+ 500 ₺</button>
                                <button class="btn-preset" onclick="selectDepositAmount(1000)">+ 1000 ₺</button>
                                <button class="btn-preset" onclick="selectDepositAmount(5000)">+ 5000 ₺</button>
                            </div>
                            <div class="deposit-input-wrapper">
                                <label class="settings-field" style="flex: 1; margin-bottom: 0;">
                                    <span>Yüklenecek Tutar (₺)</span>
                                    <input type="number" id="deposit-amount-input" placeholder="Tutar girin..." min="1" step="any" oninput="updateDepositButtonState()">
                                </label>
                                <button class="btn-deposit-submit" id="btn-deposit-submit" onclick="handleDepositSubmit()" disabled>
                                    <i class="bi bi-wallet2"></i>
                                    <span>Yükle</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Действия -->
                    <div class="settings-actions">
                        <button class="btn-inspect" onclick="cancelSettingsChanges()">İptal</button>
                        <button class="btn-buy btn-sell" onclick="saveSettingsChanges()">Değişiklikleri Kaydet</button>
                    </div>

                    <!-- Danger Zone -->
                    <div class="settings-card danger-zone-card" style="margin-top: 8px; border-color: rgba(239,68,68,0.35);">
                        <div class="settings-card-heading">
                            <div>
                                <h2 style="color: #ef4444;">Tehlikeli Bölge</h2>
                                <p>Bu işlemler geri alınamaz. Lütfen dikkatli olun.</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                            <div>
                                <strong style="color: var(--text-primary); font-size: 14px;">Hesabı Kalıcı Olarak Sil</strong>
                                <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">Tüm verileriniz (envanter, arkadaşlar, takaslar) kalıcı olarak silinir.</p>
                            </div>
                            <button class="btn-delete-account" onclick="openDeleteAccountModal()">
                                <i class="bi bi-trash3-fill"></i> Hesabı Sil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Delete Account Confirm Modal -->
        <div class="modal-backdrop" id="delete-account-modal" aria-hidden="true" onclick="handleDeleteAccountBackdrop(event)">
            <div class="delete-account-modal-card" role="dialog" aria-modal="true">
                <div class="delete-modal-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
                <h2>Hesabı Sil</h2>
                <p>Bu işlem <strong>geri alınamaz</strong>. Hesabınız, envanteriniz, arkadaşlarınız ve tüm takaslarınız kalıcı olarak silinecektir.</p>
                <p style="font-size: 13px; color: var(--text-muted);">Devam etmek istediğinizden emin misiniz?</p>
                <div class="modal-actions" style="margin-top: 24px;">
                    <button class="btn-inspect" onclick="closeDeleteAccountModal()">İptal</button>
                    <button class="btn-delete-account" id="btn-confirm-delete" onclick="confirmDeleteAccount(this)">
                        <i class="bi bi-trash3-fill"></i> Evet, Hesabımı Sil
                    </button>
                </div>
            </div>
        </div>

        <style>
            .deposit-section-body {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .deposit-presets {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }
            .btn-preset {
                height: 42px;
                background: var(--bg-main);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                color: var(--text-primary);
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .btn-preset:hover {
                background: var(--bg-card-soft);
                border-color: var(--accent-blue);
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
            }
            .btn-preset:active {
                transform: scale(0.98);
            }
            .deposit-input-wrapper {
                display: flex;
                align-items: flex-end;
                gap: 16px;
            }
            .btn-deposit-submit {
                height: 40px;
                padding: 0 24px;
                background: linear-gradient(135deg, var(--accent-blue), #9333ea);
                border: none;
                border-radius: 8px;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                margin-bottom: 2px;
            }
            .btn-deposit-submit:hover:not(:disabled) {
                opacity: 0.9;
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
                transform: translateY(-1px);
            }
            .btn-deposit-submit:disabled {
                background: var(--border-color);
                color: var(--text-muted);
                cursor: not-allowed;
                opacity: 0.5;
            }
            .danger-zone-card {
                background: rgba(239, 68, 68, 0.04);
            }
            .btn-delete-account {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 0 20px;
                height: 40px;
                background: transparent;
                border: 1.5px solid #ef4444;
                border-radius: 8px;
                color: #ef4444;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .btn-delete-account:hover {
                background: #ef4444;
                color: #ffffff;
                box-shadow: 0 0 12px rgba(239,68,68,0.4);
            }
            .delete-account-modal-card {
                background: var(--bg-card);
                border: 1px solid rgba(239,68,68,0.4);
                border-radius: 16px;
                padding: 40px 36px;
                max-width: 460px;
                width: 90%;
                text-align: center;
                box-shadow: 0 24px 60px rgba(0,0,0,0.6);
                animation: modalIn 0.25s ease;
            }
            .delete-modal-icon {
                font-size: 48px;
                color: #ef4444;
                margin-bottom: 16px;
            }
            .delete-account-modal-card h2 {
                font-size: 22px;
                font-weight: 700;
                color: #ef4444;
                margin-bottom: 12px;
            }
            .delete-account-modal-card p {
                font-size: 14px;
                color: var(--text-muted);
                line-height: 1.6;
                margin-bottom: 6px;
            }
            /* Switch toggle slider styling */
            .switch-toggle {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 24px;
            }
            .switch-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .slider-toggle {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--bg-main);
                border: 1px solid var(--border-color);
                transition: .3s;
                border-radius: 24px;
            }
            .slider-toggle:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 3px;
                bottom: 3px;
                background-color: var(--text-muted);
                transition: .3s;
                border-radius: 50%;
            }
            .switch-toggle input:checked + .slider-toggle {
                background-color: var(--accent-blue);
                border-color: var(--accent-blue);
            }
            .switch-toggle input:checked + .slider-toggle:before {
                transform: translateX(24px);
                background-color: #ffffff;
            }
            @keyframes modalIn {
                from { opacity: 0; transform: scale(0.93); }
                to   { opacity: 1; transform: scale(1); }
            }
        </style>
    `;

    document.getElementById('settings-root').innerHTML = settingsHTML;
}

function renderTextField(label, key, value, type = 'text') {
    return `
        <label class="settings-field">
            <span>${label}</span>
            <input type="${type}" value="${value}" data-setting="${key}" oninput="updateSettingValue('${key}', this.value)">
        </label>
    `;
}

function updateSettingValue(key, value) {
    settingsState[key] = value;
}

async function saveSettingsChanges() {
    const saveBtn = document.querySelector('.settings-actions .btn-buy');
    const prevText = saveBtn ? saveBtn.textContent : 'Değişiklikleri Kaydet';
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Kaydediliyor...';
    }

    try {
        if (settingsState.newPassword) {
            if (settingsState.newPassword !== settingsState.confirmPassword) {
                throw new Error('Yeni şifreler eşleşmiyor!');
            }
            if (!settingsState.currentPassword) {
                throw new Error('Yeni bir şifre belirlemek için mevcut şifre gereklidir.');
            }
        }

        const updatePayload = {
            displayName: settingsState.fullName,
            email: settingsState.email,
            isInventoryPrivate: settingsState.isInventoryPrivate
        };

        if (settingsState.newPassword) {
            updatePayload.password = settingsState.newPassword;
            updatePayload.currentPassword = settingsState.currentPassword;
        }

        const response = await updateUserSettings(updatePayload);

        // Update global user model
        if (typeof currentUser !== 'undefined') {
            currentUser.displayName = response.data.displayName;
            currentUser.email = response.data.email;
            currentUser.isInventoryPrivate = response.data.isInventoryPrivate;
        }

        // Refresh components
        if (typeof renderSidebar === 'function') renderSidebar();
        if (typeof renderTopbar === 'function') renderTopbar('Settings');

        // Clear password fields
        settingsState.currentPassword = '';
        settingsState.newPassword = '';
        settingsState.confirmPassword = '';

        alert('Ayarlar başarıyla kaydedildi!');
        renderSettings();
    } catch (error) {
        alert('Ayarlar kaydedilirken hata oluştu: ' + error.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = prevText;
        }
    }
}

function cancelSettingsChanges() {
    const userObj = typeof currentUser !== 'undefined' ? currentUser : null;
    if (userObj) {
        settingsState.fullName = userObj.displayName || userObj.username || '';
        settingsState.email = userObj.email || (userObj.username ? `${userObj.username}@tradestrike.dev` : 'traderpro@tradestrike.dev');
        settingsState.avatar = (userObj.displayName || userObj.username || 'TP').substring(0, 2).toUpperCase();
        settingsState.isInventoryPrivate = !!userObj.isInventoryPrivate;
    }
    settingsState.currentPassword = '';
    settingsState.newPassword = '';
    settingsState.confirmPassword = '';
    renderSettings();
}

window.updatePrivacySetting = function(checked) {
    settingsState.isInventoryPrivate = checked;
};

window.selectDepositAmount = function(amount) {
    const input = document.getElementById('deposit-amount-input');
    if (input) {
        input.value = amount;
        updateDepositButtonState();
    }
};

window.updateDepositButtonState = function() {
    const input = document.getElementById('deposit-amount-input');
    const submitBtn = document.getElementById('btn-deposit-submit');
    if (input && submitBtn) {
        const val = parseFloat(input.value);
        submitBtn.disabled = isNaN(val) || val <= 0;
    }
};

window.handleDepositSubmit = async function() {
    const input = document.getElementById('deposit-amount-input');
    if (!input) return;

    const amount = parseFloat(input.value);
    if (isNaN(amount) || amount <= 0) {
        showToast('Lütfen geçerli bir tutar girin', 'error');
        return;
    }

    const submitBtn = document.getElementById('btn-deposit-submit');
    const prevHTML = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="width: 1rem; height: 1rem; border: 0.15em solid currentColor; border-right-color: transparent; border-radius: 50%; display: inline-block; vertical-align: text-bottom; animation: spinner-border .75s linear infinite; margin-right: 6px;"></span> <span>Yükleniyor...</span>';
    }

    try {
        const response = await depositUserBalance(amount);
        
        // Update global user model
        if (typeof currentUser !== 'undefined') {
            currentUser.balance = response.data.balance;
        }

        // Show success toast
        showToast(`Bakiye başarıyla yüklendi: ${amount.toFixed(2)} ₺!`, 'success');

        // Clear input
        input.value = '';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-wallet2"></i> <span>Yükle</span>';
            submitBtn.disabled = true;
        }

        // Refresh UI components
        if (typeof renderSidebar === 'function') renderSidebar();
        if (typeof renderTopbar === 'function') renderTopbar('Ayarlar');
        renderSettings();
    } catch (error) {
        showToast('Bakiye yüklenemedi: ' + error.message, 'error');
        if (submitBtn) {
            submitBtn.innerHTML = prevHTML || '<i class="bi bi-wallet2"></i> <span>Yükle</span>';
            submitBtn.disabled = false;
        }
    }
};

// Add spinner animation style
if (!document.getElementById('spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = `
        @keyframes spinner-border {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// ─── Delete Account Modal Handlers ─────────────────────────────────────────

window.openDeleteAccountModal = function() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }
};

window.closeDeleteAccountModal = function() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
};

window.handleDeleteAccountBackdrop = function(event) {
    if (event.target.id === 'delete-account-modal') {
        closeDeleteAccountModal();
    }
};

window.confirmDeleteAccount = async function(btn) {
    const prevHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-right-color:transparent;border-radius:50%;animation:spinner-border .75s linear infinite;vertical-align:middle;margin-right:6px;"></span> Siliniyor...';

    try {
        await deleteUserAccount();
        // Clear auth token and redirect to login
        localStorage.removeItem('authToken');
        closeDeleteAccountModal();
        showToast('Hesabınız başarıyla silindi.', 'success');
        setTimeout(() => {
            if (typeof renderAuthScreen === 'function') {
                renderAuthScreen('login');
            } else {
                window.location.reload();
            }
        }, 1500);
    } catch (error) {
        showToast('Hesap silinemedi: ' + error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = prevHTML;
    }
};
