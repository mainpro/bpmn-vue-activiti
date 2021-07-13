import request from '@/utils/request';

// 查询modeler
export function getDefinitionXML(params) {
  return request({
    url: 'api/processDefinition/getDefinitionXML',
    method: 'get',
    params: params,
  });
}

// 保存
export function addDeploymentByString(data) {
  return request({
    url: 'api/processDefinition/addDeploymentByString',
    method: 'post',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    data,
  });
}

//查询用户列表
export function getUsers(params) {
  return request({
    url: 'api/users',
    method: 'get',
    params: params,
  });
}

//自定义规则
export function getRuleResult(params) {
  return request({
    url: 'api/rule/getRuleResult',
    method: 'post',
    data: params,
  });
}

//查询用户列表
export function getGroup(params) {
  return request({
    url: 'api/actIdGroup',
    method: 'get',
    params: params,
  });
}
