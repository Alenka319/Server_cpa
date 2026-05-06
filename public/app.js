// Простой роутер на hashchange
const routes = {
    '/': renderHome,
    '/create': renderCreate,
};

function router() {
    const hash = window.location.hash.slice(1) || '/';
    const route = routes[hash] || renderNotFound;
    route();
}

// Рендер главной = таблица пользователей
async function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>Загрузка...</h2>';
    
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        if (users.length === 0) {
            app.innerHTML = '<h2>Пользователи</h2><p>Нет пользователей. Создайте первого!</p>';
            return;
        }
        
        let table = '<h2>Пользователи</h2>';
        table += '<table border="1" cellpadding="8" cellspacing="0">';
        table += '<thead><tr><th>ID</th><th>Имя</th><th>Email</th></tr></thead>';
        table += '<tbody>';
        
        users.forEach(user => {
            table += `<tr>
                        <td>${user.id}</td>
                        <td>${escapeHtml(user.name)}</td>
                        <td>${escapeHtml(user.email)}</td>
                      </tr>`;
        });
        
        table += '</tbody></table>';
        app.innerHTML = table;
    } catch (error) {
        app.innerHTML = '<p>Ошибка загрузки пользователей</p>';
    }
}

// Форма создания пользователя
function renderCreate() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Создать пользователя</h2>
        <form id="createUserForm">
            <div>
                <label>Имя: </label>
                <input type="text" id="name" required />
            </div>
            <br/>
            <div>
                <label>Email: </label>
                <input type="email" id="email" required />
            </div>
            <br/>
            <button type="submit">Создать</button>
        </form>
        <div id="message"></div>
    `;
    
    const form = document.getElementById('createUserForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const messageDiv = document.getElementById('message');
        
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            
            if (response.ok) {
                messageDiv.innerHTML = '<p style="color: green;">Пользователь создан! Переход на главную...</p>';
                setTimeout(() => {
                    window.location.hash = '#/';
                }, 1000);
            } else {
                const error = await response.json();
                messageDiv.innerHTML = `<p style="color: red;">Ошибка: ${error.error}</p>`;
            }
        } catch (error) {
            messageDiv.innerHTML = '<p style="color: red;">Ошибка сервера</p>';
        }
    });
}

function renderNotFound() {
    document.getElementById('app').innerHTML = '<h2>404 - Страница не найдена</h2>';
}

// Простой экранирование от XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Слушаем изменения хэша
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
