// utils/sectionHelper.js
export const getSectionTitle = (questionData) => {
    if (questionData.section) {
        return questionData.section
    }

    const sectionMap = {
        writing: '写作',
        listening: '听力',
        reading: '阅读理解',
        translation: '翻译',
        choice: '选择',
        true_false: '判断题',
        cloze: '完形填空'
    }

    // 优先使用 type，其次使用 examType
    const type = questionData.type || questionData.examType
    return sectionMap[type] || '未知题型'
}
