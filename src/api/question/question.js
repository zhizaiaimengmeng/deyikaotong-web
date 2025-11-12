import request from '@/utils/request'

export function queryQuestions(data) {
  return request({
    url: '/question-server/question/queryQuestions',
    method: 'post',
    data
  })
}

export function createQuestion(data) {
  return request({
    url: '/question-server/question/createQuestion',
    method: 'post',
    data
  })
}

export function getQuestionById(data) {
  return request({
    url: '/question-server/question/getQuestionById',
    method: 'post',
    data
  })
}

export function updateQuestion(data) {
  return request({
    url: '/question-server/question/updateQuestion',
    method: 'post',
    data
  })
}

export function deleteQuestion(data) {
  return request({
    url: '/question-server/question/deleteQuestion',
    method: 'post',
    data
  })
}

