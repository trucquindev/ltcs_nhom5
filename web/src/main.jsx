import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Provider } from 'react-redux'
import { store } from '~/redux/store.js'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { injectStore } from './untils/authorizeAxios.js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

const persistor = persistStore(store)
injectStore(store)

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter basename='/'>
          <App />
          <ToastContainer
            position="bottom-left"
            theme="light"
            toastStyle={{
              background: '#ffffff',
              color: '#1d1d1f',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.12)',
              fontSize: '13px',
            }}
          />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </QueryClientProvider>
)
