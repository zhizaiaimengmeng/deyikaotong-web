// src/utils/suppress-warnings.js

// 保存原始控制台方法
const originalWarn = console.warn;
const originalError = console.error;

// 要过滤的警告关键词
const suppressedKeywords = [
    'Deprecation Warning',
    'deprecated',
    'legacy-js-api',
    'function-units',
    'slash-div',
    'Using / for division'
];

// 重写 console.warn
console.warn = function (...args) {
    const message = args[0] || '';

    // 检查是否包含要过滤的关键词
    const shouldSuppress = suppressedKeywords.some(keyword =>
        typeof message === 'string' && message.includes(keyword)
    );

    if (!shouldSuppress) {
        originalWarn.apply(console, args);
    }
};

// 重写 console.error（可选）
console.error = function (...args) {
    const message = args[0] || '';

    const shouldSuppress = suppressedKeywords.some(keyword =>
        typeof message === 'string' && message.includes(keyword)
    );

    if (!shouldSuppress) {
        originalError.apply(console, args);
    }
};

console.log('Sass 警告过滤器已启用');