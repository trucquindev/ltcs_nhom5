import axios from 'axios';
import { toast } from 'react-toastify';
import { interceptorLoadingElements } from './formatters';
import { refreshTokenAPI } from '~/apis';
import { logoutUserAPI } from '~/redux/user/userSlice';

// khong the import store from redux/store thong thuong o day
// Giai phap: Inject store : kỹ thuật cần khi sử dụng redux store ở các file ngoài phạm vi component nhu file authorization hien tai
// Hiểu đơn giản khi chạy lên code sẽ vào main.jsx đầu tiên từ bên đó chúng ta gọi hàm injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này
// https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
let axiosReduxStore;
export const injectStore = (mainStore) => {
  axiosReduxStore = mainStore;
};

// khởi tạo một đối tượng Axios mục đích để custom và cấu hình chung cho dự án
let authorizedAxiosInstance = axios.create();

// thời gian chờ tối đa của 1 request : 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10;

// witd creadentials : sẽ cho phép axios tự động gửi cookie lên mỗi request trên BE
authorizedAxiosInstance.defaults.withCredentials = true;

// cấu hình interceptors (Bộ đánh chặn giữa mọi request và response)
// https://axios-http.com/docs/interceptors

// interceptor requests: Can thiệp vào giữa nhưng request api
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // chặn spam click
    interceptorLoadingElements(true);
    // Attach Bearer token from Redux store (LTCS C# backend uses Bearer auth)
    const state = axiosReduxStore?.getState?.()
    const token = state?.user?.currentUser?.accessToken
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Khoi tao 1 cai promise cho viec goi api refresh_token
// muc dich la de khi nao goi api refresh_token xong thi moi retry lai nhieu api bi loi truoc do
//https://www.thedutchlab.com/insights/using-axios-interceptors-for-refreshing-your-api-token
let refreshTokenPromise = null;

//  interceptor responses : Can thiệp vào giữa những response nhận về
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // chặn spam click
    interceptorLoadingElements(false);
    return response;
  },
  (error) => {
    // chặn spam click
    interceptorLoadingElements(false);

    // xu ly refresh token tu dong
    //TH1: neu nhu be tra ma 403, 401 thi logout luon
    if (error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserAPI(false));
    }
    //TH2: neu nhu be tra ma 410 thi goi api refresh token lam moi lai access token
    //lay cac api bi loi thong qua error.config
    const originalRequests = error.config;
    if (error.response?.status === 410 && !originalRequests._retry) {
      // Gán thêm 1 giá trị _retry luôn = true trong khoản thời gian chờ , đảm bảo việc refresh token này chỉ luôn gọi 1 lần tai 1 thời điểm
      originalRequests._retry = true;
      // kiem tra xem neu chua co refreshTokenPromise thì thực hiện gán việc gọi api refreshtoken đồng thời gán vào cho cái refreshtokenPromise
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then((data) => {
            // đồng thời accessToken đã nằm trong httpOnlyCookie (xử lý ở BE)
            return data?.accessToken;
          })
          .catch((_error) => {
            // Nếu nhận bất kỳ lỗi nào từ api refreshToken thì cứ logout luôn
            // Thêm dòng return để tránh một lỗi bị gọi api logout 2 lần nếu api refreshtoken trả về lỗi
            axiosReduxStore.dispatch(logoutUserAPI(false));
            return Promise.reject(_error);
          })
          .finally(() => {
            //Dù api có thành công hay lỗi thì vẫn phải set lai refreshTokenPromise = null
            refreshTokenPromise = null;
          });
      }
      //Cần return  truong hop chạy thành công và xử lý thêm ở đây
      // eslint-disable-next-line no-unused-vars
      return refreshTokenPromise.then((accessToken) => {
        // B1 xử lý đối với trường hợp lưu accessToken cần lưu localStorage thì cần viết thêm ở đây

        //B2 return lại cái instance voi các request lỗi trong originalRequests để gọi lại api ban đầu
        return authorizedAxiosInstance(originalRequests);
      });
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    let errorrMessage = error?.message;
    if (error.response?.data?.message) {
      errorrMessage = error.response?.data?.message;
    }
    // dùng toastify để hiện thị mọi lỗi trừ 410- GONE mã của refresh token
    if (error.response?.status !== 410) {
      toast.error(errorrMessage);
    }
    return Promise.reject(error);
  }
);

export default authorizedAxiosInstance;
