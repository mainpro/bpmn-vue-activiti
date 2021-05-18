import axios from 'axios';
import Cookies from 'js-cookie';
// import qs from 'qs';
import { ElNotification } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: localStorage.getItem('VUE_APP_BASE_API') || '/', // api 的 base_url
  timeout: '1200000', // 请求超时时间
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    let token = Cookies.get('EL-ADMIN-TOEKN');
    if (token) {
      config.headers['Authorization'] = token; // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    if (!config.headers) {
      config.headers['Content-Type'] = 'application/json';
    }

    // config.data = qs.stringify(config.data);
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

// response 拦截器
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 兼容blob下载出错json提示
    if (
      error.response.data instanceof Blob &&
      error.response.data.type.toLowerCase().indexOf('json') !== -1
    ) {
      const reader = new FileReader();
      reader.readAsText(error.response.data, 'utf-8');
      reader.onload = function (e) {
        const errorMsg = JSON.parse(reader.result).message;
        ElNotification.error({
          title: errorMsg,
          duration: 5000,
        });
      };
    } else {
      let code = 0;
      try {
        code = error.response.data.status;
      } catch (e) {
        if (error.toString().indexOf('Error: timeout') !== -1) {
          ElNotification.error({
            title: '网络请求超时',
            duration: 5000,
          });
          return Promise.reject(error);
        }
      }
      console.log(code);
      if (code) {
        if (code === 401) {
          // store.dispatch('LogOut').then(() => {
          //   // 用户登录界面提示
          //   Cookies.set('point', 401);
          //   location.reload();
          // });
        } else if (code === 403) {
          router.push({ path: '/401' });
        } else {
          const errorMsg = error.response.data.message;
          if (errorMsg !== undefined) {
            ElNotification.error({
              title: errorMsg,
              duration: 5000,
            });
          }
        }
      } else {
        ElNotification.error({
          title: '接口请求失败',
          duration: 5000,
        });
      }
    }
    return Promise.reject(error);
  },
);
export default service;
