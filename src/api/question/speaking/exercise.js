import request from '@/utils/request'

export function getSpeakingQuestions(data) {
    return request({
        url: '/question-server/question/getSpeakingQuestions',
        method: 'post',
        data
    })
}

export function getUserSpeakingProgress(data) {
    return request({
        url: '/question-server/question/getReadingQuestions',
        method: 'post',
        data
    })
}





