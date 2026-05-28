// frontend/js/components/trending.js

async function renderTrending() {
    const root = document.getElementById('trending-root');
    if (!root) return;
    
    root.innerHTML = `
        <section class="trust-showcase-section">
            <div class="trust-header-wrap">
                <span class="trust-subtitle">TRADESTRIKE AVANTAJLARI</span>
                <h2 class="trust-title">Neden Bize Güveniyorlar?</h2>
                <div class="trust-divider-glow"></div>
            </div>
            
            <div class="trust-grid">
                <div class="trust-card-premium" style="--accent-color: #10b981;">
                    <div class="trust-icon-wrapper">
                        <i class="bi bi-shield-fill-check"></i>
                    </div>
                    <h3>Güvenli Escrow</h3>
                    <p>Tüm işlemler Steam API ve gelişmiş escrow koruması ile güvence altındadır. Dolandırıcılığa geçit yok.</p>
                    <div class="trust-card-hover-line"></div>
                </div>
                
                <div class="trust-card-premium" style="--accent-color: #3b82f6;">
                    <div class="trust-icon-wrapper">
                        <i class="bi bi-lightning-charge-fill"></i>
                    </div>
                    <h3>Işık Hızında Takas</h3>
                    <p>Satın aldığınız veya takas ettiğiniz eşyalar otomatik bot sistemimizle saniyeler içinde Steam envanterinizde.</p>
                    <div class="trust-card-hover-line"></div>
                </div>
                
                <div class="trust-card-premium" style="--accent-color: #8b5cf6;">
                    <div class="trust-icon-wrapper">
                        <i class="bi bi-percent"></i>
                    </div>
                    <h3>En Düşük Komisyon</h3>
                    <p>Gizli ücretler yok. Sadece %3 komisyon oranı ile sektörün en karlı takas deneyimini yaşayın.</p>
                    <div class="trust-card-hover-line"></div>
                </div>
            </div>
        </section>
    `;
}