<?php
/**
 * РУСИНТЕГРАЦИЯ — приём заявок с сайта и отправка в Telegram.
 *
 * Файл кладётся рядом с index.html. Формы отправляют сюда POST-запрос.
 * Работает и с JavaScript (возвращает JSON), и без него (перенаправляет назад).
 */

/* ------------------------------------------------------------------
 *  Настройки
 * ------------------------------------------------------------------ */

// ВАЖНО: этот токен был передан в переписке и считается скомпрометированным.
// Перевыпустите его в @BotFather (/mybots → API Token → Revoke) и вставьте новый.
define('TG_TOKEN', '8817024251:AAESI8iAzcgZsT66-otOMYK22o5ZIfCmaa8');
define('TG_CHAT', '-5334583970');
define('TITLE', 'РУСИНТЕГРАЦИЯ');

// Куда вернуть посетителя, если он отправил форму без JavaScript
define('BACK_URL', '/');

// Не чаще одной заявки в столько секунд с одного адреса
define('THROTTLE_SEC', 20);

/* ------------------------------------------------------------------
 *  Вспомогательное
 * ------------------------------------------------------------------ */

/** Принимает ли клиент JSON-ответ (то есть отправка идёт из скрипта) */
function wantsJson()
{
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $xhr    = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    return strpos($accept, 'application/json') !== false || $xhr === 'fetch';
}

/** Единая точка выхода: JSON для скрипта, перенаправление для обычной отправки */
function finish($ok, $message, $code = 200)
{
    if (wantsJson()) {
        http_response_code($ok ? 200 : $code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        $flag = $ok ? 'sent=1' : 'error=' . rawurlencode($message);
        header('Location: ' . BACK_URL . '?' . $flag, true, 303);
    }
    exit;
}

/** Чистит присланное значение: убирает управляющие символы и ограничивает длину */
function clean($v, $max = 300)
{
    $v = (string) $v;
    $v = str_replace(["\r", "\0"], '', $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $v) ?? '';
    $v = trim($v);
    if (function_exists('mb_substr')) {
        $v = mb_substr($v, 0, $max, 'UTF-8');
    } else {
        $v = substr($v, 0, $max);
    }
    return $v;
}

/** Экранирование для разметки Telegram */
function esc($v)
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Похоже ли значение на телефон или почту */
/**
 * Телефон: ждём 11 цифр российского формата.
 * 8 и 7 в начале считаем одним и тем же кодом страны.
 */
function looksLikeContact($v)
{
    $digits = preg_replace('/\D+/', '', $v) ?? '';
    if (strlen($digits) !== 11) {
        return false;
    }
    return $digits[0] === '7' || $digits[0] === '8';
}

/* ------------------------------------------------------------------
 *  Проверки запроса
 * ------------------------------------------------------------------ */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    finish(false, 'Метод не поддерживается.', 405);
}

// Ловушка для роботов: поле скрыто от людей, заполнить его может только машина
if (clean($_POST['website'] ?? '', 100) !== '') {
    // Отвечаем как при успехе, чтобы робот не подбирал обход
    finish(true, 'Заявка принята.');
}

// Простое ограничение частоты по адресу — защищает от потока отправок
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$lock = sys_get_temp_dir() . '/ri_' . md5($ip) . '.lock';
if (is_file($lock) && (time() - (int) filemtime($lock)) < THROTTLE_SEC) {
    finish(false, 'Заявка уже отправлена. Подождите немного.', 429);
}
@touch($lock);

/* ------------------------------------------------------------------
 *  Разбор полей
 * ------------------------------------------------------------------ */

$form = clean($_POST['form'] ?? 'Форма', 60);

$name    = clean($_POST['name'] ?? '', 120);
$company = clean($_POST['company'] ?? '', 160);
$contact = clean($_POST['contact'] ?? '', 160);
$topic   = clean($_POST['topic'] ?? '', 200);
$comment = clean($_POST['comment'] ?? '', 1200);
$service = clean($_POST['service'] ?? '', 200);
$price   = clean($_POST['price'] ?? '', 100);
$page    = clean($_POST['page'] ?? '', 300);

if ($name === '') {
    finish(false, 'Укажите, как к вам обращаться.', 422);
}
if ($contact === '') {
    finish(false, 'Оставьте телефон или почту для связи.', 422);
}
if (!looksLikeContact($contact)) {
    finish(false, 'Проверьте номер телефона — похоже, есть опечатка.', 422);
}

/* ------------------------------------------------------------------
 *  Сообщение
 * ------------------------------------------------------------------ */

$lines   = [];
$lines[] = '<b>' . esc(TITLE) . '</b>';
$lines[] = '';
$lines[] = '📩 <b>' . esc($form) . '</b>';
$lines[] = '';
$lines[] = '👤 <b>Имя:</b> ' . esc($name);

if ($company !== '') {
    $lines[] = '🏢 <b>Компания:</b> ' . esc($company);
}
$lines[] = '📞 <b>Контакт:</b> ' . esc($contact);

if ($topic !== '') {
    $lines[] = '🎯 <b>Направление:</b> ' . esc($topic);
}
if ($service !== '') {
    $lines[] = '🧩 <b>Услуга:</b> ' . esc($service);
}
if ($price !== '') {
    $lines[] = '💰 <b>Ориентир:</b> ' . esc($price);
}
if ($comment !== '') {
    $lines[] = '';
    $lines[] = '💬 <b>Задача:</b>';
    $lines[] = esc($comment);
}

$lines[] = '';
$lines[] = '🕒 ' . date('d.m.Y H:i');
if ($page !== '') {
    $lines[] = '🔗 ' . esc($page);
}

$text = implode("\n", $lines);

/* ------------------------------------------------------------------
 *  Отправка
 * ------------------------------------------------------------------ */

$payload = [
    'chat_id'                  => TG_CHAT,
    'text'                     => $text,
    'parse_mode'               => 'HTML',
    'disable_web_page_preview' => true,
];

$url = 'https://api.telegram.org/bot' . TG_TOKEN . '/sendMessage';

$response = null;
$httpCode = 0;

if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_CONNECTTIMEOUT => 6,
    ]);
    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
} else {
    // Запасной путь, если на хостинге нет cURL
    $ctx = stream_context_create([
        'http' => [
            'method'        => 'POST',
            'header'        => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content'       => http_build_query($payload),
            'timeout'       => 12,
            'ignore_errors' => true,
        ],
    ]);
    $response = @file_get_contents($url, false, $ctx);
    if (isset($http_response_header[0]) &&
        preg_match('#\s(\d{3})\s#', $http_response_header[0], $m)) {
        $httpCode = (int) $m[1];
    }
}

$data = is_string($response) ? json_decode($response, true) : null;

if ($httpCode === 200 && is_array($data) && ($data['ok'] ?? false) === true) {
    finish(true, 'Заявка принята.');
}

// Не показываем посетителю технические подробности, но сохраняем их в журнал
error_log('[РУСИНТЕГРАЦИЯ] Ошибка отправки заявки. HTTP ' . $httpCode . ' — ' . (string) $response);
finish(false, 'Не удалось отправить заявку. Позвоните нам: 8 (800) 201-11-32', 502);