document.addEventListener('DOMContentLoaded', function() {
    // Функция для пути к изображениям
    function getImagePath(imageName) {
        return `images/${imageName}`;
    }

    // ===== МАССИВ ЦЕН ДЛЯ КАТЕГОРИЙ =====
    const categoryPrices = {
        'tomatoes': null,
        'cucumbers': null,
        'peppers': null,
        'hot-peppers': null,
        'zucchinis': null,
        'eggplants': null,
        'pumpkins': null,
        'watermelons': null,
        'melons': null,
        'cabbages': null,
        'flowers': '0,30'
    };

    // Текущий год
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Элементы
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav');
    const scrollButton = document.querySelector('.scroll-top');
    const backToCatalog = document.getElementById('back-to-catalog');
    const backToTabs = document.getElementById('back-to-tabs');
    const backToTabsDetail = document.getElementById('back-to-tabs-detail');

    // Параметры URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category') || '';
    const productNumber = urlParams.get('product');

    // Элементы страницы
    const productsContainer = document.getElementById('products-container');
    const productDetail = document.getElementById('product-detail');
    const mainElement = document.querySelector('main');
    const categoryTitle = document.getElementById('category-title');

    // Названия категорий
    const categoryNames = {
        'tomatoes': 'Помидоры',
        'cucumbers': 'Огурцы',
        'peppers': 'Перцы',
        'hot-peppers': 'Перцы острые',
        'zucchinis': 'Кабачки',
        'eggplants': 'Баклажаны',
        'pumpkins': 'Тыквы',
        'watermelons': 'Арбузы',
        'melons': 'Дыни',
        'cabbages': 'Капуста',
        'flowers': 'Цветы'
    };

    // Ключ для хранения позиции скролла
    const storageKey = currentCategory ? `scrollPosition_${currentCategory}` : 'scrollPosition_main';

    // Функция получения цены для категории
    function getCategoryPrice(category) {
        const price = categoryPrices[category];
        if (price === null || price === undefined) {
            return 'Цена формируется';
        }
        return `${price} р.`;
    }

    // Функция для формирования HTML описания товара
    function formatProductDescription(description) {
        if (!description) return '';

        let html = '<div class="product-descr">';

        if (description.intro) {
            html += `<p class="product-descr__intro">${description.intro}</p>`;
        }

        if (description.characteristics && description.characteristics.length > 0) {
            html += '<div class="product-descr__section">';
            html += '<h3 class="product-descr__title">Основные характеристики:</h3>';
            html += '<ul class="product-descr__list">';
            description.characteristics.forEach(item => {
                html += `<li><span class="product-descr__prop">${item.prop}:</span> ${item.value}</li>`;
            });
            html += '</ul></div>';
        }

        if (description.resistance && description.resistance.length > 0) {
            html += '<div class="product-descr__section">';
            html += '<h3 class="product-descr__title">Устойчивость к болезням:</h3>';
            html += '<ul class="product-descr__list">';
            description.resistance.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul></div>';
        }

        if (description.growing && description.growing.length > 0) {
            html += '<div class="product-descr__section">';
            html += '<h3 class="product-descr__title">Особенности выращивания:</h3>';
            html += '<ul class="product-descr__list">';
            description.growing.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul></div>';
        }

        if (description.advantages && description.advantages.length > 0) {
            html += '<div class="product-descr__section">';
            html += '<h3 class="product-descr__title">Преимущества:</h3>';
            html += '<ul class="product-descr__list product-descr__list--plus">';
            description.advantages.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul></div>';
        }

        if (description.websiteLink) {
            html += `
                <div class="product-descr__section">
                    <h3 class="product-descr__title">Узнайте больше:</h3>
                    <ul class="product-descr__list">
                        <li>Подробнее о тюльпанах можно узнать на нашем сайте: <a href="${description.websiteLink}" class="product-link" target="_blank" rel="noopener noreferrer">tulpani-borisov.by</a></li>
                    </ul>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    // Показать список товаров
    function showMainContent() {
        if (mainElement) mainElement.style.display = 'block';
        if (productDetail) productDetail.style.display = 'none';
        if (backToTabs) backToTabs.style.display = 'inline-block';
        if (backToTabsDetail) backToTabsDetail.style.display = 'none';
    }

    // Показать детальную страницу товара
    function hideMainContent() {
        if (mainElement) mainElement.style.display = 'none';
        if (productDetail) productDetail.style.display = 'block';
        if (backToTabs) backToTabs.style.display = 'none';
        if (backToTabsDetail) backToTabsDetail.style.display = 'inline-block';
    }

    // Загрузка товаров с нумерацией
    function renderProducts() {
        if (!productsContainer || !currentCategory) return;

        const products = getProductsByCategory(currentCategory);
        const currentPrice = getCategoryPrice(currentCategory);

        if (categoryTitle && categoryNames[currentCategory]) {
            categoryTitle.textContent = `Рассада ${categoryNames[currentCategory].toLowerCase()}`;
            document.title = `${categoryNames[currentCategory]} в Борисове`;
        }

        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">Товары временно отсутствуют</p>';
            return;
        }

        productsContainer.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const numberedName = `<span class="product-number">${product.number}.</span> ${product.name}`;
            const priceClass = currentPrice === 'Цена формируется' ? 'price-pending' : '';

            card.innerHTML = `
                <div class="product-card__image">
                    <img src="${getImagePath(product.image)}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-card__content">
                    <h3 class="product-card__title">${numberedName}</h3>
                    <p class="product-card__description">${product.shortDescription}</p>
                    <div class="product-card__price ${priceClass}">${currentPrice}</div>
                    <a href="?category=${currentCategory}&product=${product.number}" class="product-card__btn">Подробнее</a>
                </div>
            `;

            card.querySelector('.product-card__btn').addEventListener('click', function(e) {
                sessionStorage.setItem(storageKey, window.pageYOffset);
            });

            productsContainer.appendChild(card);
        });
    }

    // Загрузка детальной информации о товаре
    function loadProductDetail(number) {
        const product = getProductByNumber(currentCategory, number);
        const currentPrice = getCategoryPrice(currentCategory);

        if (!product) {
            const url = new URL(window.location);
            url.searchParams.delete('product');
            window.history.replaceState({}, '', url);
            showMainContent();
            if (currentCategory) renderProducts();
            return;
        }

        document.title = `${product.name} - купить в Борисове`;

        const image = document.getElementById('product-image');
        const name = document.getElementById('product-name');
        const price = document.getElementById('product-price');
        const description = document.getElementById('product-description');

        if (image) {
            image.src = getImagePath(product.image);
            image.alt = product.name;
        }

        if (name) name.innerHTML = `<span class="product-number">${product.number}.</span> ${product.name}`;

        if (price) {
            price.textContent = currentPrice;
            if (currentPrice === 'Цена формируется') {
                price.classList.add('price-pending');
            } else {
                price.classList.remove('price-pending');
            }
        }

        if (description) {
            description.innerHTML = formatProductDescription(product.description);
        }

        if (backToCatalog) {
            backToCatalog.href = `?category=${currentCategory}`;
        }
    }

    // Обработка состояния страницы
    if (productNumber) {
        const product = getProductByNumber(currentCategory, productNumber);
        if (product) {
            hideMainContent();
            loadProductDetail(productNumber);
        } else {
            const url = new URL(window.location);
            url.searchParams.delete('product');
            window.history.replaceState({}, '', url);
            showMainContent();
            if (currentCategory) renderProducts();
        }
    } else if (currentCategory) {
        showMainContent();
        renderProducts();

        const savedPosition = sessionStorage.getItem(storageKey);
        if (savedPosition) {
            setTimeout(() => {
                window.scrollTo({
                    top: parseInt(savedPosition),
                    behavior: 'auto'
                });
                sessionStorage.removeItem(storageKey);
            }, 200);
        }
    }

    // Кнопка "Вернуться к списку"
    if (backToCatalog) {
        backToCatalog.addEventListener('click', function(e) {
            e.preventDefault();

            if (productNumber && currentCategory) {
                const products = getProductsByCategory(currentCategory);
                const index = products.findIndex(p => p.number === parseInt(productNumber));
                if (index !== -1) {
                    const rowIndex = Math.floor(index / 3);
                    const targetPosition = rowIndex * 450 + 300;
                    sessionStorage.setItem(`returnPosition_${currentCategory}`, targetPosition);
                }
            }

            const url = new URL(window.location);
            url.searchParams.delete('product');
            window.history.pushState({}, '', url);

            showMainContent();
            if (currentCategory) renderProducts();

            if (currentCategory) {
                const returnPosition = sessionStorage.getItem(`returnPosition_${currentCategory}`);
                if (returnPosition) {
                    setTimeout(() => {
                        window.scrollTo({
                            top: parseInt(returnPosition),
                            behavior: 'smooth'
                        });
                        sessionStorage.removeItem(`returnPosition_${currentCategory}`);
                    }, 300);
                }
            }
        });
    }

    // Бургер-меню
    if (burger && nav) {
        burger.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });

        nav.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Плавный скролл к якорям (только на главной)
    const isMainPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

    if (isMainPage) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || this.target === '_blank') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    if (burger && burger.classList.contains('active')) {
                        burger.click();
                    }
                }
            });
        });

        // Активный пункт меню при скролле
        const navLinks = document.querySelectorAll('.nav__link');
        const scrollElements = document.querySelectorAll('section[id], #contacts');

        function setActiveLink() {
            let current = '';
            const scrollPosition = window.pageYOffset + 100;

            scrollElements.forEach(element => {
                const elementTop = element.offsetTop;
                const elementHeight = element.clientHeight;

                if (scrollPosition >= elementTop && scrollPosition < elementTop + elementHeight) {
                    current = element.getAttribute('id');
                }
            });

            // Если дошли до конца страницы — подсвечиваем контакты
            if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
                current = 'contacts';
            }

            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const targetId = href.replace('#', '');
                    if (targetId === current && current !== '') {
                        link.classList.add('active');
                    }
                }
            });
        }

        window.addEventListener('scroll', setActiveLink);
        setActiveLink();
    }

    // Кнопка наверх
    if (scrollButton) {
        window.addEventListener('scroll', function() {
            scrollButton.style.display = window.pageYOffset > 500 ? 'block' : 'none';
        });

        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Обработка кнопок назад/вперед
    window.addEventListener('popstate', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const productNumber = urlParams.get('product');
        const currentCategory = urlParams.get('category');

        if (productNumber) {
            const product = getProductByNumber(currentCategory, productNumber);
            if (product) {
                hideMainContent();
                loadProductDetail(productNumber);
            } else {
                showMainContent();
                if (currentCategory) renderProducts();
            }
        } else if (currentCategory) {
            showMainContent();
            renderProducts();
        }
    });

    // Обработка кеширования страницы
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            const urlParams = new URLSearchParams(window.location.search);
            const productNumber = urlParams.get('product');
            const currentCategory = urlParams.get('category');

            if (productNumber) {
                const product = getProductByNumber(currentCategory, productNumber);
                if (product) {
                    hideMainContent();
                    loadProductDetail(productNumber);
                } else {
                    showMainContent();
                    if (currentCategory) renderProducts();
                }
            } else if (currentCategory) {
                showMainContent();
                renderProducts();
            }
        }
    });
});