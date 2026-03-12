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
    // В реальности здесь будет список из папки 'данные'
    // Пока хардкодим Вернера Эрхарда как первого автора
    const навигация = document.getElementById('sidebar-nav');
    
    const автораСписок = ['Вернер_Эрхард']; // Список папок в 'данные/'
    
    навигация.innerHTML = автораСписок.map(имя => `
        <div class="nav-item" onclick="выбратьАвтора('${имя}')">
            ${имя.replace('_', ' ')}
        </div>
    `).join('');
}

async function выбратьАвтора(имяПапки) {
    СОСТОЯНИЕ.автор = имяПапки;
    const ответ = await fetch(`данные/${имяПапки}/инфо.json`);
    const данные = await ответ.json();
    
    // Обновляем хлебные крошки
    document.getElementById('breadcrumb').innerText = данные.имя;
    
    // Отрисовываем сетку категорий или идей
    отрисоватьСеткуИдей(данные);
    
    // Показываем правую панель с инфо об авторе
    показатьИнфоАвтора(данные);
}

function отрисоватьСеткуИдей(данные) {
    const сцена = document.getElementById('stage');
    let html = '<div class="ideas-grid">';
    
    данные.группы.forEach(группа => {
        группа.категории.forEach(кат => {
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

function ideaToId(name, index) {
    return String(index).padStart(3, '0') + '_' + name.replace(/ /g, '_');
}

async function открытьИдею(id, name) {
    const путь = `данные/${СОСТОЯНИЕ.автор}/идеи/${id}/описание.json`;
    try {
        const ответ = await fetch(путь);
        const данные = await ответ.json();
        
        document.getElementById('breadcrumb').innerText = `${СОСТОЯНИЕ.автор.replace('_', ' ')} > ${name}`;
        
        const сцена = document.getElementById('stage');
        сцена.innerHTML = `
            <div class="idea-detail">
                <h2 class="idea-title">${данные.идея}</h2>
                
                <div class="idea-image-full" style="width:100%; height:400px; background:#121922; border-radius:12px; margin-bottom:32px; background-size:contain; background-repeat:no-repeat; background-position:center; background-image:url('данные/${СОСТОЯНИЕ.автор}/идеи/${id}/рисунки/1.jpg')"></div>

                <div class="idea-poem">
                    ${данные.описание.стих.replace(/\n/g, '<br>')}
                </div>

                <div class="description-section">
                    <h5>Для детей</h5>
                    <div class="description-content">${данные.описание.ребенок}</div>
                </div>

                <div class="description-section">
                    <h5>Для взрослых</h5>
                    <div class="description-content">${данные.описание.взрослый}</div>
                </div>

                <div class="description-section">
                    <h5>В бизнесе</h5>
                    <div class="description-content">${данные.описание.бизнес}</div>
                </div>

                <div class="description-section">
                    <h5>Метафора</h5>
                    <div class="description-content">${данные.описание.метафора}</div>
                </div>
                
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
    let html = '';
    
    данные.группы.forEach(группа => {
        html += `<div class="author-group-title">${группа.название}</div>`;
        группа.категории.forEach(кат => {
            html += `<div class="nav-item">${кат.название}</div>`;
        });
    });
    
    навигация.innerHTML = html;
}
