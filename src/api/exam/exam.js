import request from '@/utils/request'

export function getQuestionsForExam(data) {
    return request({
        url: '/exam-server/exam/getQuestionsForExam',
        method: 'post',
        data
    })
}



