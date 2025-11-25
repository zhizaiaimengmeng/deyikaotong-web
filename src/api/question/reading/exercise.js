import request from '@/utils/request'

export function getReadingArticles(data) {
    return request({
        url: '/question-server/question/getReadingArticles',
        method: 'post',
        data
    })
}

export function getReadingQuestions(data) {
    return request({
        url: '/question-server/question/getReadingQuestions',
        method: 'post',
        data
    })
}






