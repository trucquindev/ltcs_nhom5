import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'

const TABS = { ACCOUNT: 'account', SECURITY: 'security' }

function Settings() {
  const location = useLocation()
  const getDefaultTab = () => location.pathname.includes(TABS.SECURITY) ? TABS.SECURITY : TABS.ACCOUNT
  const [activeTab, setActiveTab] = useState(getDefaultTab())

  return (
    <div className="page-content">
      <div className="page-header"><h1>Settings</h1></div>
      <div className="settings-layout">
        <div className="settings-sidebar">
          {[
            { key: TABS.ACCOUNT, label: '👤 Account', to: '/settings/account' },
            { key: TABS.SECURITY, label: '🔒 Security', to: '/settings/security' },
          ].map(tab => (
            <Link key={tab.key} to={tab.to}
              className={`settings-nav-item${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="settings-content">
          {activeTab === TABS.ACCOUNT && <AccountTab />}
          {activeTab === TABS.SECURITY && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

export default Settings
