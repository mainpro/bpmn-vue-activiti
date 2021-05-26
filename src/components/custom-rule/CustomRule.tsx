import {ElInput, ElButton, ElTag, ElSelect, ElOption} from 'element-plus';
import {defineComponent, PropType, computed, reactive, ref, onMounted, watch} from 'vue';
import './custom-rule.css';

import {getRuleResult} from '@/api/data';

const CustomRule = defineComponent({
  props: {
    handleCustomRule: {
      type: Function,
      default: undefined,
    },
    ruleData: {
      type: Array,
      default: [],
    },
  },
  directives: {
    focus: {
      mounted(el, binding, vnode) {
        el.querySelector('input').focus();
      },
    },
    ruleLoad: {
      mounted(el, binding, vnode) {
        binding.value();
      },
    },
  },
  setup(props, ctx) {
    const data = reactive({
      // reactive定义变量
      inputVisible: false, //是否显示input
      inputValue: '', //input的value
      dynamicRules: props.ruleData, //动态规则
      defaultParam: {
        key: '', //主键
        name: '', //节点名称
        value: '', //节点值
        level: 'L0', //节点级别
        kind: '', //节点属性
      },
      param: [], //查询规则所需参数
      loading: false, //加载数据loading
      ruleData: [], //规则下拉框数据
      ruleShowData: [], //筛选之后的规则
      checkData: '', //选中下拉框的值
    });
    onMounted(() => {});
    //显示输入框
    const showInput = () => {
      data.inputVisible = true;
    };
    //保存规则框
    const handleInputConfirm = (e) => {
      if (!data.inputValue || e.keyCode !== 13) {
        return;
      }
      data.dynamicRules.push({value: data.inputValue, name: data.inputValue, level: 'L5'});
      data.inputVisible = false;
      data.inputValue = '';
    };
    //删除某个规则节点
    const handleTagClose = (index) => {
      data.dynamicRules.splice(index, 1);
      // data.dynamicRules = data.dynamicRules.filter((item: any) => item.name != tag.name);
    };
    //加载下拉数据
    const loadRules = () => {
      //TODO 读取数据
      data.loading = true;
      let param = data.dynamicRules;
      if (data.dynamicRules.length === 0) {
        param = [data.defaultParam];
      }
      getRuleResult(param).then((response: any) => {
        console.log(response);
        data.loading = false;
        data.ruleData = response.data;
        data.ruleShowData = response.data;
      });
    };
    //下拉框搜索
    const filterMethod = (kw: string) => {
      console.log(kw);
      data.inputValue = kw;
      if (kw) {
        data.ruleShowData = data.ruleData.filter((item) => item.name.indexOf(kw) >= 0);
      } else {
        data.ruleShowData = data.ruleData;
      }
    };
    //下拉框选择
    const handleSelectChange = (item) => {
      data.dynamicRules.push(item);
      data.inputVisible = false;
      data.checkData = '';
    };
    //下拉框失去焦点
    const handleInputBlur = () => {
      data.inputVisible = false;
      data.checkData = '';
    };

    watch(
      data.dynamicRules,
      (val) => {
        console.log('规则改变');
        props.handleCustomRule(val);
      },
      {
        // lazy: true,
        deep: true,
        // flush: 'pre' | 'post' | 'sync',
        // flush: 'pre',
        // onTrack: (e) => console.log('onTrack'),
        // onTrigger: (e) => console.log('onTrigger'),
      },
    );

    return () => (
      <div class="rule-box">
        {data.dynamicRules.map((item, index) => {
          return (
            <ElTag closable onClose={() => handleTagClose(index)}>
              {item.name}
            </ElTag>
          );
        })}
        {data.inputVisible ? (
          // <ElInput v-focus={true} v-model={data.inputValue} class="input-new-tag" size="small" onKeyup={handleInputConfirm}></ElInput>
          <ElSelect
            v-focus={true}
            v-ruleLoad={loadRules}
            v-model={data.checkData}
            filterable
            clearable={true}
            reserve-keyword
            placeholder=" "
            loading={data.loading}
            class="select-new-tag"
            filter-method={filterMethod}
            onKeyup={handleInputConfirm}
            onClear={handleInputBlur}
          >
            {data.ruleShowData.map((item, index) => {
              return <ElOption key={item.key} label={item.name} value={item.value} onClick={() => handleSelectChange(item)}></ElOption>;
            })}
          </ElSelect>
        ) : (
          <ElButton class="button-new-tag" size="small" onClick={showInput}>
            点击添加
          </ElButton>
        )}
      </div>
    );
  },
});

export default CustomRule;
