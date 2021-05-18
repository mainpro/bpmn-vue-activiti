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
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}
