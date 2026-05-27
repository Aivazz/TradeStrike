// frontend/js/components/trending.js

async function renderTrending() {
    const root = document.getElementById('trending-root');
    
    try {
        const response = await getTrendingItems();
        // Дублируем массив несколько раз, чтобы карусель никогда не заканчивалась
        const items = [...response.data, ...response.data, ...response.data]; 

        root.innerHTML = `
            <section class="trending-section">
                <div class="section-heading">
                    <h2>Popüler Eşyalar</h2>
                    <a href="#">Tümünü Gör</a>
                </div>
                <div style="overflow: hidden; width: 100%; padding-bottom: 10px;">
                    <div id="trending-carousel" style="display: flex; gap: 20px; transition: transform 0.6s ease-in-out;">
                        ${items.map(renderTrendCard).join('')}
                    </div>
                </div>
                <div class="market-divider"></div>
            </section>
        `;

        startCarousel();
    } catch (error) {
        root.innerHTML = `
            <section class="trending-section">
                <div class="section-heading">
                    <h2>Popüler Eşyalar</h2>
                    <a href="#">Tümünü Gör</a>
                </div>
                <div class="state-panel error-state">${error.message}</div>
                <div class="market-divider"></div>
            </section>
        `;
    }
}

function renderTrendCard(item) {
    // Жестко задаем ширину: 25% минус отступы, чтобы на экране всегда было ровно 4 карточки
    return `
        <article class="trend-card" style="flex: 0 0 calc(25% - 15px); min-width: 0;">
            <div class="trend-header">
                <div class="trend-image"><img src="${item.imageUrl}" alt="${item.image}"></div>
                <div class="trend-meta">
                    <h3>${item.name}</h3>
                    <div class="trend-price">
                        <span>${item.price.toFixed(2)} &#8378;</span>
                        <span class="trend-change"><i class="bi bi-arrow-up-right"></i> ${item.change}</span>
                    </div>
                </div>
            </div>
            <div class="trend-line"></div>
        </article>
    `;
}

function startCarousel() {
    const carousel = document.getElementById('trending-carousel');
    if (!carousel) return;

    setInterval(() => {
        // Шаг 1: Плавно сдвигаем весь ряд влево ровно на одну карточку + отступ (gap)
        carousel.style.transition = 'transform 0.6s ease-in-out';
        carousel.style.transform = 'translateX(calc(-25% - 5px))';

        // Шаг 2: Как только анимация закончилась (через 600мс), перестраиваем DOM
        setTimeout(() => {
            // Отключаем анимацию, чтобы перескок был незаметным
            carousel.style.transition = 'none'; 
            
            // Берем самую первую карточку и переносим её в конец очереди
            carousel.appendChild(carousel.firstElementChild); 
            
            // Возвращаем контейнер на исходную позицию (пользователь ничего не заметит)
            carousel.style.transform = 'translateX(0)'; 
        }, 600); 

    }, 3000); // Карусель будет сдвигаться каждые 3 секунды
}