import request from '@/utils/request'

export function getWritingQuestions(data) {
    return request({
        url: '/question-server/question/getWritingQuestions',
        method: 'post',
        data
    })
}

export function getUserWritingProgress(data) {
    return request({
        url: '/question-server/question/getUserWritingProgress',
        method: 'post',
        data
    })
}

export function saveWritingDraft(data) {
    return request({
        url: '/question-server/question/saveWritingDraft',
        method: 'post',
        data
    })
}
