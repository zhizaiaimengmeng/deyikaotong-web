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

export function getListeningCategory(data) {
  return request({
    url: '/question-server/question/getListeningCategory',
    method: 'post',
    data
  })
}

export function getQuestionByCategory(data) {
  return request({
    url: '/question-server/question/getQuestionByCategory',
    method: 'post',
    data
  })
}

export function getAudiosByCategory(data) {
  return request({
    url: '/question-server/question/getAudiosByCategory',
    method: 'post',
    data
  })
}
//获取每个音频的题目数量
export function getAudioQuestionCount(data) {
  return request({
    url: '/question-server/question/getAudioQuestionCount',
    method: 'post',
    data
  })
}
// 获取某个音频的题目
export function getAudioQuestions(data) {
  return request({
    url: '/question-server/question/getAudioQuestions',
    method: 'post',
    data
  })
}





