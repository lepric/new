// Конфигурация для VK Mini App
// Загружайте эту ссылку ПЕРЕД app.js в HTML

// Проверка окружения
const isVKApp = window.location.href.includes('vk.com') || 
                window.vkBridge || 
                typeof VK !== 'undefined';

console.log('Приложение запущено в VK:', isVKApp);

// Инициализация VK Bridge
if (!window.vkBridge && typeof vkBridge !== 'undefined') {
    window.vkBridge = vkBridge;
}

// Настройка VK SDK
if (typeof VK !== 'undefined') {
    VK.init({
        apiId: 54468793, 
    });
}

// Для локального тестирования
if (!window.vkBridge) {
    console.warn('VK Bridge не доступен. Приложение работает в режиме тестирования.');
    window.vkBridge = {
        send: function(method, params) {
            console.log(`VK Bridge: ${method}`, params);
            return Promise.resolve({ success: true });
        },
        subscribe: function(handler) {
            console.log('VK Bridge: subscribe');
        },
    };
}
