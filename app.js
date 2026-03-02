// Инициализация VK Bridge
const vkBridge = window.vkBridge;

// Проверяем, что приложение работает внутри VK Mini App
if (!vkBridge) {
    console.error('VK Bridge не загружен');
} else {
    // Подписываемся на события VK
    vkBridge.subscribe((event) => {
        console.log('Получено событие:', event);
    });
}

// Объект для хранения напоминаний
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

// Сохранение напоминаний в localStorage
function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Получение ID пользователя (если доступно)
let userId = null;
if (vkBridge) {
    vkBridge.send('VKWebAppGetUserInfo')
        .then(data => {
            userId = data.id;
            console.log('ID пользователя:', userId);
        })
        .catch(error => {
            console.error('Ошибка получения информации о пользователе:', error);
            // В целях тестирования используем фиктивный ID
            userId = 'test_user';
        });
} else {
    userId = 'test_user';
}

// Функция для переключения экранов
function showScreen(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показываем указанный экран
    document.getElementById(screenId).classList.add('active');
}

// Функция для форматирования даты
function formatDate(dateString, timeString) {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Функция для получения описания частоты
function getFrequencyDescription(frequency) {
    const descriptions = {
        'once': 'Один раз',
        'daily': 'Каждый день',
        'weekly': 'Раз в неделю',
        'monthly': 'Раз в месяц',
        'quarterly': 'Раз в квартал',
        'yearly': 'Раз в год'
    };
    return descriptions[frequency] || frequency;
}

// Функция для отображения списка напоминаний
function displayReminders(targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        console.error(`Элемент с ID ${targetElementId} не найден`);
        return;
    }
    
    // Очищаем содержимое элемента
    targetElement.innerHTML = '';
    
    if (reminders.length === 0) {
        targetElement.innerHTML = '<div class="no-reminders">У вас пока нет напоминаний</div>';
        return;
    }
    
    reminders.forEach((reminder, index) => {
        const reminderElement = document.createElement('div');
        reminderElement.className = 'reminder-item';
        
        reminderElement.innerHTML = `
            <div class="reminder-title">${reminder.title}</div>
            <div class="reminder-text">${reminder.text}</div>
            <div class="reminder-date">Отправка: ${formatDate(reminder.date, reminder.time)}</div>
            <div class="reminder-frequency">Частота: ${getFrequencyDescription(reminder.frequency)}</div>
        `;
        
        // Если это экран удаления, добавляем кнопку удаления
        if (targetElementId === 'delete-reminders-list') {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Удалить это напоминание';
            deleteBtn.onclick = () => deleteReminder(index);
            reminderElement.appendChild(deleteBtn);
        }
        
        targetElement.appendChild(reminderElement);
    });
}

// Функция для удаления напоминания
function deleteReminder(index) {
    if (confirm('Вы уверены, что хотите удалить это напоминание?')) {
        reminders.splice(index, 1);
        saveReminders();
        displayReminders('reminders-list');
        displayReminders('delete-reminders-list');
    }
}

// Обработчики событий для кнопок
document.addEventListener('DOMContentLoaded', function() {
    // Кнопки главного экрана
    document.getElementById('create-reminder-btn').addEventListener('click', function() {
        showScreen('step1-screen');
        // Очищаем форму при начале создания нового напоминания
        document.getElementById('reminder-title').value = '';
        document.getElementById('reminder-text').value = '';
        document.getElementById('reminder-date').value = '';
        document.getElementById('reminder-time').value = '';
        document.querySelector('input[name="frequency"][value="once"]').checked = true;
    });
    
    document.getElementById('show-reminders-btn').addEventListener('click', function() {
        displayReminders('reminders-list');
        showScreen('reminders-screen');
    });
    
    document.getElementById('delete-reminder-btn').addEventListener('click', function() {
        displayReminders('delete-reminders-list');
        showScreen('delete-screen');
    });
    
    // Навигация между шагами создания напоминания
    document.getElementById('next-step1').addEventListener('click', function() {
        const title = document.getElementById('reminder-title').value.trim();
        if (title === '') {
            alert('Пожалуйста, введите название напоминания');
            return;
        }
        showScreen('step2-screen');
    });
    
    document.getElementById('prev-step2').addEventListener('click', function() {
        showScreen('step1-screen');
    });
    
    document.getElementById('next-step2').addEventListener('click', function() {
        const text = document.getElementById('reminder-text').value.trim();
        if (text === '') {
            alert('Пожалуйста, введите текст напоминания');
            return;
        }
        showScreen('step3-screen');
    });
    
    document.getElementById('prev-step3').addEventListener('click', function() {
        showScreen('step2-screen');
    });
    
    document.getElementById('next-step3').addEventListener('click', function() {
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;
        
        if (!date || !time) {
            alert('Пожалуйста, укажите дату и время для напоминания');
            return;
        }
        
        // Проверяем, что дата и время не в прошлом
        const selectedDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        
        if (selectedDateTime <= now) {
            alert('Дата и время должны быть в будущем');
            return;
        }
        
        showScreen('step4-screen');
    });
    
    document.getElementById('prev-step4').addEventListener('click', function() {
        showScreen('step3-screen');
    });
    
    document.getElementById('finish-creation').addEventListener('click', function() {
        const title = document.getElementById('reminder-title').value.trim();
        const text = document.getElementById('reminder-text').value.trim();
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;
        const frequency = document.querySelector('input[name="frequency"]:checked').value;
        
        // Создаем объект напоминания
        const newReminder = {
            id: Date.now(), // уникальный ID на основе времени
            userId: userId,
            title: title,
            text: text,
            date: date,
            time: time,
            frequency: frequency,
            createdAt: new Date().toISOString()
        };
        
        // Добавляем напоминание в массив
        reminders.push(newReminder);
        saveReminders();
        
        // Показываем сообщение об успешном создании
        alert('Напоминание успешно создано!');
        
        // Возвращаемся на главный экран
        showScreen('action-screen');
    });
    
    // Кнопки возврата на главный экран
    document.getElementById('back-to-main').addEventListener('click', function() {
        showScreen('action-screen');
    });
    
    document.getElementById('back-to-main-from-list').addEventListener('click', function() {
        showScreen('action-screen');
    });
    
    document.getElementById('back-to-main-from-delete').addEventListener('click', function() {
        showScreen('action-screen');
    });
});

// Функция для проверки необходимости отправки напоминаний
function checkReminders() {
    const now = new Date();
    const currentDateString = now.toISOString().split('T')[0];
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    reminders.forEach((reminder, index) => {
        if (reminder.date === currentDateString && reminder.time === currentTimeString) {
            // Отправляем уведомление через VK Bridge
            if (vkBridge) {
                vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
                    .then(() => {
                        // После показа рекламы (используется как триггер для уведомления), 
                        // показываем информационное окно с текстом напоминания
                        return vkBridge.send('VKWebAppShowStoryBox', {
                            story_type: 'photo',
                            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/240px-Placeholder_view_vector.svg.png',
                            attachment: {
                                type: 'url',
                                url: '#',
                                text: reminder.title
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Ошибка показа рекламы или стори:', error);
                        // Резервный вариант - показываем алерт
                        alert(`Напоминание: ${reminder.title}\n\n${reminder.text}`);
                    });
            } else {
                // Для тестирования вне VK
                alert(`Напоминание: ${reminder.title}\n\n${reminder.text}`);
            }
            
            // Обновляем дату напоминания в зависимости от частоты
            updateReminderDate(index);
        }
    });
}

// Функция для обновления даты напоминания в зависимости от частоты
function updateReminderDate(reminderIndex) {
    const reminder = reminders[reminderIndex];
    const currentDate = new Date(`${reminder.date}T${reminder.time}`);
    
    switch(reminder.frequency) {
        case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
        case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
        case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        case 'quarterly':
            currentDate.setMonth(currentDate.getMonth() + 3);
            break;
        case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
        case 'once':
            // Удаляем одноразовое напоминание
            reminders.splice(reminderIndex, 1);
            saveReminders();
            return;
    }
    
    // Обновляем дату и время в напоминании
    reminder.date = currentDate.toISOString().split('T')[0];
    reminder.time = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    saveReminders();
}

// Запускаем проверку напоминаний каждую минуту
setInterval(checkReminders, 60000); // 60000 мс = 1 минута

// Выполняем начальную проверку
setTimeout(checkReminders, 5000); // Через 5 секунд после загрузки