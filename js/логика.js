/**
 * ГНОСТИКА — Ядро логики v2
 * Динамическая загрузка данных из иерархической структуры папок.
 */

const СОСТОЯНИЕ = {
    автор: null,
    категория: null,
    идея: null,
    админ: false
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    console.log('Гностика запущена');
    загрузитьГлобальноеМеню();
});

async function загрузитьГлобальноеМеню() {
    const навигация = document.getElementById('sidebar-nav');
    
    // Глобальная структура авторов по направлениям
    const МЕНЮ = [
        {
            категория: "ПРОБУЖДЕНИЕ",
            авторы: [
                { id: "Георгий_Гурджиев", имя: "ГЕОРГИЙ ГУРДЖИЕВ" },
                { id: "Нисаргадатта_Махарадж", имя: "НИСАРГАДАТТА МАХАРАДЖ" }
            ]
        },
        {
            категория: "ТРАНСФОРМАЦИЯ",
            авторы: [
                { id: "Вернер_Эрхард", имя: "ВЕРНЕР ЭРХАРД" }
            ]
        },
        {
            категория: "СИСТЕМНОЕ МЫШЛЕНИЕ",
            авторы: [
                { id: "Рассел_Акофф", имя: "РАССЕЛ АКОФФ" },
                { id: "Питер_Сенге", имя: "ПИТЕР СЕНГЕ" },
                { id: "Донелла_Медоуз", имя: "ДОНЕЛЛА МЕДОУЗ" },
                { id: "Джон_ОКоннор", имя: "ДЖОН О'КОННОР" }
            ]
        },
        {
            категория: "МЕНЕДЖМЕНТ",
            авторы: [
                { id: "Питер_Друкер", имя: "ПИТЕР ДРУКЕР" },
                { id: "Том_Питерс", имя: "ТОМ ПИТЕРС" },
                { id: "Китами_Масао", имя: "КИТАМИ МАСАО" }
            ]
        },
        {
            категория: "НАУКА",
            авторы: [
                { id: "Дональд_Хоффман", имя: "ДОНАЛЬД ХОФФМАН" }
            ]
        },
        {
            категория: "ПРОДУКТИВНОСТЬ",
            авторы: [
                { id: "Джессика_Хэги", имя: "ДЖЕССИКА ХЭГИ" }
            ]
        },
        {
            категория: "ОБУЧЕНИЕ",
            авторы: [
                { id: "Мортимер_Адлер", имя: "МОРТИМЕР АДЛЕР" }
            ]
        },
        {
            категория: "ЭЗОТЕРИКА И ОСМЫСЛЕНИЕ",
            авторы: [
                { id: "УГ_Кришнамурти", имя: "У.Г. КРИШНАМУРТИ" },
                { id: "Стрельникова_Секлитова", имя: "Л. СЕКЛИТОВА И Л. СТРЕЛЬНИКОВА" }
            ]
        }
    ];
    
    let html = '';
    
    МЕНЮ.forEach(группа => {
        // Заголовок категории
        html += `<div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px 12px;">${группа.категория}</div>`;
        
        // Список авторов
        группа.авторы.forEach(автор => {
            html += `
                <div class="nav-item ${автор.id === СОСТОЯНИЕ.автор ? 'active' : ''}" id="nav-${автор.id}" onclick="выбратьАвтора('${автор.id}')">
                    ${автор.имя}
                </div>
            `;
        });
    });
    
    навигация.innerHTML = html;
}

let ТЕКУЩИЕ_ДАННЫЕ = null;

async function выбратьАвтора(имяПапки) {
    СОСТОЯНИЕ.автор = имяПапки;
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${имяПапки}`);
    if (activeNav) activeNav.classList.add('active');

    try {
        const ответ = await fetch(`данные/${имяПапки}/инфо.json`);
        if (!ответ.ok) throw new Error('Данные не найдены');
        const данные = await ответ.json();
        ТЕКУЩИЕ_ДАННЫЕ = данные;
        
        // Обновляем хлебные крошки
        document.getElementById('breadcrumb').innerText = данные.имя;
        
        // Отрисовываем сетку категорий или идей
        отрисоватьСеткуИдей(данные);
        
        // Показываем правую панель с инфо об авторе
        показатьИнфоАвтора(данные);
    } catch (e) {
        // Если автора еще нет в базе
        document.getElementById('stage').innerHTML = `
            <div style="text-align:center; padding: 50px; color: var(--text-secondary);">
                <h2>Материалы автора в разработке</h2>
                <p>Мы еще не загрузили идеи для ${имяПапки.replace('_', ' ')}.</p>
            </div>
        `;
        document.getElementById('info-panel').classList.add('hidden');
        document.getElementById('breadcrumb').innerText = имяПапки.replace('_', ' ');
    }
}

function отрисоватьСеткуИдей(данные, фильтрКатегория = null) {
    const сцена = document.getElementById('stage');
    let html = '<div class="ideas-grid">';
    
    данные.группы.forEach(группа => {
        группа.категории.forEach(кат => {
            if (фильтрКатегория && кат.название !== фильтрКатегория) return;
            
            кат.идеи.forEach((идея, индекс) => {
                const id = ideaToId(идея, индекс + 1);
                html += `
                    <div class="idea-card" onclick="открытьИдею('${id}', '${идея}')">
                        <div class="idea-card-img" style="background-image: url('данные/${СОСТОЯНИЕ.автор}/идеи/${id}/рисунки/1.jpg')"></div>
                        <div class="idea-card-content">
                            <h4>${идея}</h4>
                        </div>
                    </div>
                `;
            });
        });
    });
    
    html += '</div>';
    сцена.innerHTML = html;
}

function фильтроватьПоКатегории(названиеКатегории) {
    document.getElementById('breadcrumb').innerText = `${ТЕКУЩИЕ_ДАННЫЕ.имя} > ${названиеКатегории}`;
    отрисоватьСеткуИдей(ТЕКУЩИЕ_ДАННЫЕ, названиеКатегории);
    
    // Подсвечиваем активный пункт
    document.querySelectorAll('#author-nav .nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.innerText === названиеКатегории) {
            el.classList.add('active');
        }
    });
}


function ideaToId(name, index) {
    return String(index).padStart(3, '0') + '_' + name.replace(/ /g, '_');
}

// Глобальная переменная для хранения загруженных данных идеи
let ТЕКУЩАЯ_ИДЕЯ_ДАННЫЕ = null;

async function открытьИдею(id, name) {
    const путь = `данные/${СОСТОЯНИЕ.автор}/идеи/${id}/описание.json`;
    let данные = {};
    
    // Пытаемся загрузить текстовые данные идеи
    try {
        const ответ = await fetch(путь);
        if (ответ.ok) {
            данные = await ответ.json();
        }
    } catch (e) {
        console.warn('Файл описание.json не найден. Открывается только ОБРАЗ.');
    }
    
    ТЕКУЩАЯ_ИДЕЯ_ДАННЫЕ = {
        название: name,
        id: id,
        ...данные
    };
    
    document.getElementById('breadcrumb').innerText = `${СОСТОЯНИЕ.автор.replace(/_/g, ' ')} > ${name}`;
    
    const сцена = document.getElementById('stage');
    
    сцена.innerHTML = `
        <div class="idea-detail">
            <!-- Вкладки (Tabs) -->
            <div class="idea-tabs-container">
                <button class="idea-tab active" onclick="переключитьВкладкуИдеи('ОБРАЗ')">ОБРАЗ</button>
                <button class="idea-tab" onclick="переключитьВкладкуИдеи('СТИХИ')">СТИХИ</button>
                <button class="idea-tab" onclick="переключитьВкладкуИдеи('ПРИТЧИ')">ПРИТЧИ</button>
                <button class="idea-tab" onclick="переключитьВкладкуИдеи('ПРИМЕРЫ')">ПРИМЕРЫ</button>
                <button class="idea-tab" onclick="переключитьВкладкуИдеи('ДИСТИНКЦИИ')">ДИСТИНКЦИИ</button>
                <button class="idea-tab" onclick="переключитьВкладкуИдеи('МЕТАФОРЫ')">МЕТАФОРЫ</button>
                <button class="idea-tab" onclick="переключитьВкладкуИдеи('ОПИСАНИЕ')">ОПИСАНИЕ</button>
            </div>
            
            <h2 class="idea-title" style="text-align: left; margin-top: 10px; margin-bottom: 20px;">${name}</h2>
            
            <!-- Контейнер для меняющегося контента -->
            <div id="idea-content-area" class="idea-content-area">
                <!-- По умолчанию ОБРАЗ -->
                <img src="данные/${СОСТОЯНИЕ.автор}/идеи/${id}/рисунки/1.jpg" style="width:100%; border-radius:8px; display:block;" onerror="this.onerror=null; this.src=''; this.alt='ОБРАЗ НЕ ЗАГРУЖЕН'; this.style.backgroundColor='#121922'; this.style.aspectRatio='1/1'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center'; this.style.color='#fff';">
            </div>
            
            <button class="btn btn-secondary" style="margin-top:40px" onclick="выбратьАвтора('${СОСТОЯНИЕ.автор}')">← НАЗАД К СПИСКУ</button>
        </div>
    `;
}

// Глобальная функция для переключения вкладок
window.переключитьВкладкуИдеи = function(вкладка) {
    if (!event) return;
    
    // Управление подсветкой вкладок
    document.querySelectorAll('.idea-tab').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const area = document.getElementById('idea-content-area');
    const данные = ТЕКУЩАЯ_ИДЕЯ_ДАННЫЕ;
    const описание = данные.описание || {};
    
    if (вкладка === 'ОБРАЗ') {
        area.innerHTML = `<img src="данные/${СОСТОЯНИЕ.автор}/идеи/${данные.id}/рисунки/1.jpg" style="width:100%; border-radius:8px; display:block;" onerror="this.onerror=null; this.src=''; this.alt='ОБРАЗ НЕ ЗАГРУЖЕН';">`;
        return;
    }
    
    const mapKeys = {
        'СТИХИ': ['стих'],
        'ПРИТЧИ': ['притча'],
        'ПРИМЕРЫ': ['примеры из жизни', 'примеры из бизнеса', 'примеры из работы'],
        'ДИСТИНКЦИИ': ['дистинкция'],
        'МЕТАФОРЫ': ['метафора']
    };
    
    let html = '';
    
    // Специальная вкладка ОПИСАНИЕ собирает всё остальное
    if (вкладка === 'ОПИСАНИЕ') {
        let knownKeys = ['стих', 'притча', 'примеры из жизни', 'примеры из бизнеса', 'примеры из работы', 'дистинкция', 'метафора'];
        let hasCustomInfo = false;
        
        for (const [key, value] of Object.entries(описание)) {
            if (!knownKeys.includes(key) && typeof value === 'string') {
                const title = key.toUpperCase();
                html += `<div class="description-section"><h5>${title}</h5><div class="description-content">${value.replace(/\\n/g, '<br>')}</div></div>`;
                hasCustomInfo = true;
            }
        }
        
        if (!hasCustomInfo && данные.текст) {
            html += `<div class="description-section"><h5>СУТЬ ИДЕИ</h5><div class="description-content">${данные.текст.replace(/\\n/g, '<br>')}</div></div>`;
            hasCustomInfo = true;
        }
        
        if (!hasCustomInfo) {
            html = `<div style="text-align:center; padding: 50px; color: var(--text-secondary);">Дополнительное описание пока не добавлено.</div>`;
        }
    } else {
        const keys = mapKeys[вкладка];
        let found = false;
        
        if (keys) {
            keys.forEach(k => {
                if (описание[k]) {
                    const title = k.toUpperCase();
                    html += `<div class="description-section"><h5>${title}</h5><div class="description-content">${описание[k].replace(/\\n/g, '<br>')}</div></div>`;
                    found = true;
                }
            });
        }
        
        if (!found) {
            html = `<div style="text-align:center; padding: 50px; color: var(--text-secondary);">Материалы раздела «${вкладка}» находятся в разработке.</div>`;
        }
    }
    
    area.innerHTML = html;
}

// Функции интерфейса
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}

function openAuth() {
    document.getElementById('auth-ov').classList.remove('hidden');
}

function closeAuth() {
    document.getElementById('auth-ov').classList.add('hidden');
}

function checkAuth() {
    const pass = document.getElementById('auth-in').value;
    if (pass === '1234') {
        СОСТОЯНИЕ.админ = true;
        document.getElementById('admin-controls').classList.remove('hidden');
        closeAuth();
        alert('Режим администратора активирован');
    } else {
        alert('Неверный пароль');
    }
}

function goHome() {
    location.reload();
}

function показатьИнфоАвтора(данные) {
    const панель = document.getElementById('info-panel');
    панель.classList.remove('hidden');
    document.getElementById('author-name').innerText = данные.имя;
    document.getElementById('author-role').innerText = данные.роль || "АВТОР";
    
    // Загрузка фото автора, если указано в JSON
    const photoEl = document.getElementById('author-photo');
    if (данные.фото) {
        photoEl.style.backgroundImage = `url('${данные.фото}')`;
        photoEl.style.display = 'block';
        photoEl.style.cursor = 'pointer';
        photoEl.onclick = () => открытьПрофильАвтора(СОСТОЯНИЕ.автор);
        photoEl.title = "Нажмите, чтобы открыть профиль автора";
    } else {
        photoEl.style.display = 'none';
        photoEl.style.backgroundImage = '';
        photoEl.onclick = null;
    }
    
    // Заполняем группы
    const навигация = document.getElementById('author-nav');
    let html = `<div class="nav-item active" style="margin-bottom: 20px; font-weight: 600;" onclick="фильтроватьПоКатегории('')">ВСЕ ИДЕИ</div>`;
    
    данные.группы.forEach(группа => {
        html += `<div class="author-group-title">${группа.название}</div>`;
        группа.категории.forEach(кат => {
            html += `<div class="nav-item" onclick="фильтроватьПоКатегории('${кат.название}')">${кат.название}</div>`;
        });
    });
    
    навигация.innerHTML = html;
}

window.открытьПрофильАвтора = async function(авторId) {
    if (!авторId) авторId = СОСТОЯНИЕ.автор;
    const данные = ТЕКУЩИЕ_ДАННЫЕ;
    if (!данные) return;

    let профиль = {};
    try {
        const ответ = await fetch(`данные/${авторId}/профиль.json`);
        if (ответ.ok) {
            профиль = await ответ.json();
        }
    } catch(e) {}

    document.getElementById('breadcrumb').innerText = `${данные.имя.toUpperCase()} > БИОГРАФИЯ И КНИГИ`;
    const сцена = document.getElementById('stage');
    
    let galleryHtml = `<img src="${данные.фото}" alt="Портрет" style="width:100%; border-radius:12px; margin-bottom: 20px;">`;
    
    if (профиль.фотографии && профиль.фотографии.length > 0) {
        профиль.фотографии.forEach(photo => {
            galleryHtml += `<img src="${photo}" style="width:100%; border-radius:12px; margin-bottom: 10px;">`;
        });
    }

    if (профиль.книги && профиль.книги.length > 0) {
        galleryHtml += `<h3 style="margin-top: 20px; font-size: 16px; margin-bottom: 10px; color: var(--accent-color); border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">ИЗДАННЫЕ КНИГИ</h3>`;
        профиль.книги.forEach(book => {
            galleryHtml += `
                <div class="book-card" style="display: flex; gap: 15px; margin-bottom: 15px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                    ${book.обложка ? `<img src="${book.обложка}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 4px;">` : '<div style="width: 80px; height: 110px; background: var(--hover-bg); border-radius: 4px;"></div>'}
                    <div>
                        <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #fff;">${book.название}</h4>
                        <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${book.описание || ''}</p>
                    </div>
                </div>
            `;
        });
    }

    let bioHtml = `<h2 style="font-size: 32px; margin-top: 0; margin-bottom: 10px; color: #fff; text-transform: uppercase;">${данные.имя}</h2>`;
    bioHtml += `<div style="color: var(--accent-color); font-weight: 600; letter-spacing: 2px; margin-bottom: 30px;">${данные.роль || 'АВТОР'}</div>`;
    
    if (профиль.достижения && профиль.достижения.length > 0) {
        bioHtml += `<div style="margin-bottom: 30px; background: var(--hover-bg); padding: 20px; border-radius: 8px;">
            <h4 style="margin-top: 0; margin-bottom: 15px; color: #fff; font-size: 16px;">ВКЛАД И ОСНОВНЫЕ ИДЕИ</h4>
            <ul style="padding-left: 20px; color: var(--text-secondary); margin: 0; line-height: 1.6;">
                ${профиль.достижения.map(d => `<li style="margin-bottom: 5px;">${d}</li>`).join('')}
            </ul>
        </div>`;
    }

    if (профиль.биография) {
        let text = Array.isArray(профиль.биография) ? профиль.биография.join('<br><br>') : профиль.биография;
        bioHtml += `<div style="font-size: 16px; line-height: 1.8; color: var(--text-secondary); text-align: justify;">${text}</div>`;
    } else {
        bioHtml += `<div style="font-size: 16px; line-height: 1.8; color: var(--text-secondary);">Подробная биография и материалы находятся в разработке...</div>`;
    }

    сцена.innerHTML = `
        <div class="author-profile-container" style="display: flex; gap: 40px; text-align: left; padding: 20px;">
            <div class="author-gallery" style="flex: 0 0 320px; max-height: calc(100vh - 180px); overflow-y: auto; padding-right: 15px;">
                ${galleryHtml}
            </div>
            <div class="author-bio" style="flex: 1; max-height: calc(100vh - 180px); overflow-y: auto; padding-right: 15px;">
                ${bioHtml}
            </div>
        </div>
        <div style="padding: 20px; border-top: 1px solid var(--border-color);">
            <button class="btn btn-secondary" onclick="выбратьАвтора('${авторId}')">← НАЗАД К СПИСКУ ИДЕЙ</button>
        </div>
    `;
};
