import {ElInput, ElDialog, ElButton, ElTabs, ElTabPane, ElCheckboxGroup, ElCheckbox, ElTag} from 'element-plus';
import {defineComponent, PropType, computed, reactive, ref, onMounted} from 'vue';
import CustomRule from '@/components/custom-rule';
import './prefix-label-rule.css';

import {getUsers} from '@/api/data';

const PrefixLabelRule = defineComponent({
  props: {
    ...ElInput.props,
    prefixTitle: {
      type: String as PropType<string>,
      default: () => '',
    },
    suffixIcon: {
      type: String as PropType<string>,
      default: () => '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    onMounted(() => {
      console.log('挂载');
      //TODO 读取用户
      //queryUser();
      //回填
      if (props.modelValue) {
        let temp = props.modelValue.replace("${uelExpressionCheckService.getAllUserInfo('", '').replace("${uelExpressionCheckService.checkPassCondition('", '').replace("',bill)}", '');
        temp = decodeURIComponent(temp);
        data.resultList = JSON.parse(temp);
        data.checkList.BILL = data.resultList.BILL.map((item) => {
          return item.value;
        });
        data.checkList.USER = data.resultList.USER.map((item) => {
          return item.value - 0;
        });
      }
    });
    const data = reactive({
      // reactive定义变量
      dialogVisible: false,
      searchKey: '', //查询用户关键字
      userParams: {
        //查询用户接口 参数
        page: 0,
        size: 10,
        sort: 'id,desc',
        blurry: '', //关键字放到这里
      },
      userDataList: [],

      tab: ctx.attrs.bindKey === 'candidateUsers' ? 'USER' : 'CUSTOM',
      checkList: reactive({
        //指定用户选择列表
        USER: [],
        BILL: [],
        // LEADER: [],
        GROUP: [],
        CUSTOM: [],
      }),
      resultList: reactive({
        //结果展示
        USER: [],
        BILL: [],
        // LEADER: [],
        GROUP: [],
        CUSTOM: [],
      }),

      computedModelValue: computed({
        get: () => props.modelValue,
        set: (val) => {
          ctx.emit('update:modelValue', val);
        },
      }),
    });
    const openDialog = () => {
      data.dialogVisible = true;
    };
    const closeDialog = () => {
      data.dialogVisible = false;
    };
    const submitDialog = () => {
      data.dialogVisible = false;
      if (ctx.attrs.bindKey === 'candidateUsers') {
        data.computedModelValue = "${uelExpressionCheckService.getAllUserInfo('" + encodeURIComponent(JSON.stringify(data.resultList)) + "',bill)}";
      } else if (ctx.attrs.bindKey === 'conditionExpression.body') {
        data.computedModelValue = "${uelExpressionCheckService.checkPassCondition('" + encodeURIComponent(JSON.stringify(data.resultList)) + "',bill)}";
      }
    };
    const userListload = () => {
      console.log('下拉加载');
      if (data.searchKey) {
        data.userParams.blurry = data.searchKey;
      } else {
        data.userParams.blurry = '';
      }
      getUsers(data.userParams).then((response: any) => {
        console.log(response);
        if (response.content.length > 0) {
          data.userDataList = [...data.userDataList, ...response.content];
          data.userParams.page += 1;
        }
      });
    };
    //选择用户
    const userCheck = (checked, event) => {
      //给resultList填写数据
      let name = event.target.name;
      let value = event.target.value;
      if (checked) {
        data.resultList[data.tab].push({name, value});
      } else {
        data.resultList[data.tab] = data.resultList[data.tab].filter((item: any) => item.value !== value);
      }
    };
    //结果区 删除某个tag
    const handleTagClose = (tab, tag) => {
      data.resultList[tab] = data.resultList[tab].filter((item: any) => item.value !== tag.value);
      data.checkList[tab] = data.checkList[tab].filter((item: any) => item != tag.value);
    };
    //筛选用户
    const queryUser = () => {
      if (data.searchKey) {
        data.userParams.blurry = data.searchKey;
      } else {
        data.userParams.blurry = '';
      }
      data.userParams.page = 0;
      data.userDataList = [];
    };
    //接收自定义规则
    const handleCustomRule = (rules: []) => {
      console.log(rules);
      data.resultList['CUSTOM'] = rules;
    };
    return () => (
      <div class="prefix-label-select-container">
        {props.prefixTitle && <div class="prefix-title ">{props.prefixTitle}</div>}
        <ElInput readonly={true} placeholder="请选择" suffix-icon={props.suffixIcon || 'el-icon-s-tools'} v-model={data.computedModelValue} onClick={openDialog}></ElInput>
        <ElDialog title="设置规则" v-model={data.dialogVisible} width="50%">
          <ElTabs tab-position="left" style="height:245px;padding:10px" v-model={data.tab}>
            {ctx.attrs.bindKey === 'candidateUsers' ? (
              <>
                <ElTabPane label="指定人员" name="USER">
                  <ElInput v-model={data.searchKey} placeholder="请输入筛选条件" v-slots={{append: (): JSX.Element => <ElButton onClick={queryUser} icon="el-icon-search"></ElButton>}}></ElInput>
                  {/* <ElInput type="text" placeholder="请输入筛选条件" v-slots={{suffix: (): JSX.Element => <i class="el-input__icon el-icon-search"></i>}}></ElInput> */}
                  <div class="infinite-list" v-infinite-scroll={userListload} style="height:200px;overflow:auto">
                    <ElCheckboxGroup v-model={data.checkList.USER}>
                      {data.userDataList?.map((item: any) => {
                        return (
                          <ElCheckbox label={item.id} name={item.nickName} onChange={userCheck}>
                            {item.nickName}
                          </ElCheckbox>
                        );
                      })}
                    </ElCheckboxGroup>
                  </div>
                </ElTabPane>
                <ElTabPane label="单据相关人员" name="BILL">
                  <ElCheckboxGroup v-model={data.checkList.BILL}>
                    <ElCheckbox label="CREATOR" name="创建人" onChange={userCheck}>
                      创建人
                    </ElCheckbox>
                    <ElCheckbox label="ORDER_MANAGER" name="订单经理" onChange={userCheck}>
                      订单经理
                    </ElCheckbox>
                    <ElCheckbox label="CREATOR.DIRECT_LEADER" name="创建人直线经理" onChange={userCheck}>
                      创建人直线经理
                    </ElCheckbox>
                    <ElCheckbox label="CREATOR.SECOND_LEADER" name="创建人二线经理" onChange={userCheck}>
                      创建人二线经理
                    </ElCheckbox>
                    <ElCheckbox label="ORDER_MANAGER.DIRECT_LEADER" name="订单经理直线经理" onChange={userCheck}>
                      订单经理直线经理
                    </ElCheckbox>
                    <ElCheckbox label="ORDER_MANAGER.SECOND_LEADER" name="订单经理二线经理" onChange={userCheck}>
                      订单经理二线经理
                    </ElCheckbox>
                  </ElCheckboxGroup>
                </ElTabPane>
                {/* <ElTabPane label="指定直属领导" name="LEADER">
              <ElCheckboxGroup v-model={data.checkList.leader}>
                <ElCheckbox label="a" name="直线经理" onChange={userCheck}>
                  直线领导
                </ElCheckbox>
                <ElCheckbox label="b" name="二线经理" onChange={userCheck}>
                  二线经理
                </ElCheckbox>
              </ElCheckboxGroup>
            </ElTabPane> */}
                <ElTabPane label="指定群组" name="GROUP">
                  //TODO 群组数据待开发
                </ElTabPane>
              </>
            ) : null}
            <ElTabPane label="自定义规则" name="CUSTOM">
              <CustomRule {...{handleCustomRule: handleCustomRule, ruleData: data.resultList['CUSTOM']}} />
            </ElTabPane>
          </ElTabs>
          {data.resultList.length > 0 ? (
            <div class="result-box">
              {data.resultList.map((item) => {
                return (
                  <div class="result">
                    <span class="tab">{item.tab}</span>
                    {item.tags.map((jtem, idx) => {
                      return (
                        <ElTag closable onClose={() => handleTagClose(item.tab, jtem, item.tagIds[idx])}>
                          {jtem}
                        </ElTag>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : null}
          <div class="result-box">
            {ctx.attrs.bindKey === 'candidateUsers' ? (
              <>
                <div class="result">
                  <span class="tab">指定用户</span>
                  {data.resultList['USER'].map((item: any) => {
                    return (
                      <ElTag closable onClose={() => handleTagClose('user', item)}>
                        {item.name}
                      </ElTag>
                    );
                  })}
                </div>

                <div class="result">
                  <span class="tab">单据相关人员</span>
                  {data.resultList['BILL'].map((item: any) => {
                    return (
                      <ElTag closable onClose={() => handleTagClose('bill', item)}>
                        {item.name}
                      </ElTag>
                    );
                  })}
                </div>
                <div class="result">
                  <span class="tab">指定群组</span>
                  {data.resultList['GROUP'].map((item: any) => {
                    return (
                      <ElTag closable onClose={() => handleTagClose('group', item)}>
                        {item.name}
                      </ElTag>
                    );
                  })}
                </div>
              </>
            ) : null}

            <div class="result">
              <span class="tab">自定义规则</span>
              {data.resultList['CUSTOM'].map((item: any) => {
                return (
                  <ElTag closable onClose={() => handleTagClose('custom', item)}>
                    {item.name}
                  </ElTag>
                );
              })}
            </div>
          </div>

          <div class="dialog-footer">
            <ElButton
              type="default"
              {...{
                onClick: (): void => closeDialog(),
              }}
            >
              取 消
            </ElButton>
            <ElButton
              type="primary"
              {...{
                onClick: (): void => submitDialog(),
              }}
            >
              确 定
            </ElButton>
          </div>
        </ElDialog>
      </div>
    );
  },
});

export default PrefixLabelRule;
