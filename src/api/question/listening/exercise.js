import request from '@/utils/request'

export function getExerciseDetail(data) {
    return request({
        url: '/question-server/question/getExerciseDetail',
        method: 'post',
        data
    })
}


export function submitAnswer(data) {
    return request({
        url: '/question-server/question/submitAnswer',
        method: 'post',
        data
    })
}
