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

async function открытьИдею(id, name) {
    const путь = `данные/${СОСТОЯНИЕ.автор}/идеи/${id}/описание.json`;
    try {
        const ответ = await fetch(путь);
        const данные = await ответ.json();
        
        document.getElementById('breadcrumb').innerText = `${СОСТОЯНИЕ.автор.replace('_', ' ')} > ${name}`;
        
        let описаниеHtml = '';
        if (данные.описание) {
            if (данные.описание.стих) {
                описаниеHtml += `<div class="idea-poem">${данные.описание.стих.replace(/\\n/g, '<br>')}</div>`;
            }
            if (данные.описание.притча) {
                описаниеHtml += `<div class="description-section"><h5>Притча</h5><div class="description-content">${данные.описание.притча.replace(/\\n/g, '<br>')}</div></div>`;
            }
            for (const [ключ, значение] of Object.entries(данные.описание)) {
                if (ключ !== 'стих' && ключ !== 'притча') {
                    const заголовок = ключ.charAt(0).toUpperCase() + ключ.slice(1);
                    описаниеHtml += `
                    <div class="description-section">
                        <h5>${заголовок}</h5>
                        <div class="description-content">${значение.replace(/\\n/g, '<br>')}</div>
                    </div>
                    `;
                }
            }
        } else if (данные.текст) {
            описаниеHtml += `
            <div class="description-section">
                <h5>Суть идеи</h5>
                <div class="description-content">${данные.текст.replace(/\\n/g, '<br>')}</div>
            </div>
            `;
        }

        сцена.innerHTML = `
            <div class="idea-detail">
                <h2 class="idea-title" style="text-align: center;">${данные.идея || данные.название}</h2>
                
                <div class="idea-image-full" style="width:100%; max-width: 600px; aspect-ratio:1/1; background:#121922; border-radius:12px; margin: 0 auto 32px auto; background-size:cover; background-repeat:no-repeat; background-position:center; background-image:url('данные/${СОСТОЯНИЕ.автор}/идеи/${id}/рисунки/1.jpg')"></div>

                ${описаниеHtml}
                
                <button class="btn btn-secondary" style="margin-top:20px" onclick="выбратьАвтора('${СОСТОЯНИЕ.автор}')">← НАЗАД К СПИСКУ</button>
            </div>
        `;
    } catch (e) {
        alert('Описание для этой идеи еще не создано. Переходим в режим генерации...');
    }
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
    document.getElementById('author-role').innerText = данные.роль;
    
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
