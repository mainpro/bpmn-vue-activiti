import { getDefinitionXML } from '@/api/data';

import './modeler.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import { defineComponent, onMounted } from 'vue';
import createDefaultBpmnXml from '../../bpmn/defaultBpmnXml';
import activitiModdel from '../../bpmn/resources/activiti-moddel.json';
import translate from '../../bpmn/i18n';
import { BpmnStore } from '../../bpmn/store';

const getUrlParam = (url: string) => {
  var object = {};
  if (url.indexOf('?') != -1) {
    var str = url.split('?')[1];
    var strs = str.split('&');
    for (var i = 0; i < strs.length; i++) {
      object[strs[i].split('=')[0]] = strs[i].split('=')[1];
    }
    return object;
  }
  return object[url];
};

export default defineComponent({
  name: 'Modeler',
  setup() {
    const bpmnContext = BpmnStore;
    onMounted(() => {
      bpmnContext.initModeler({
        container: '#modeler-container',
        additionalModules: [
          //添加翻译
          { translate: ['value', translate('zh')] },
        ],
        moddleExtensions: {
          activiti: activitiModdel,
        },
      });
      var param = getUrlParam(window.location.href);
      if (param.type === 'addBpmn') {
        const defaultName = '新的流程';
        const defaultKey = 'new' + new Date().getTime();
        bpmnContext
          .importXML(createDefaultBpmnXml(defaultKey, defaultName))
          .then((result: Array<string>) => {
            if (result.length) {
              console.warn('importSuccess warnings', result);
            }
          })
          .catch((err: any) => {
            console.warn('importFail errors ', err);
          });
      } else if (param.type === 'lookBpmn') {
        //编辑bpmn
        //todo 读取数据
        let params = {
          deploymentId: param.deploymentFileUUID || '6d4af2dc-bab0-11ea-b584-3cf011eaafca',
          resourceName: decodeURI(param.deploymentName || 'String.bpmn'),
        };
        getDefinitionXML(params).then((response: any) => {
          console.log(response);
          bpmnContext
            .importXML(response)
            .then((result: Array<string>) => {
              if (result.length) {
                console.warn('importSuccess warnings', result);
              }
            })
            .catch((err: any) => {
              console.warn('importFail errors ', err);
            });
        });
      }
    });

    return () => <div id="modeler-container" />;
  },
});
