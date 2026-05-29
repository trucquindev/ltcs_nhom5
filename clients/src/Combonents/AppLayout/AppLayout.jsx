import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logoutUserAPI } from "~/redux/user/userSlice";
import { useBoardStore } from "~/store/useBoardStore";
import {
  selectWorkspaces,
  selectActiveWorkspace,
  fetchWorkspacesThunk,
  fetchActiveWorkspaceThunk,
} from "~/redux/workspace/workspaceSlice";
import Notifications from "~/Combonents/AppBar/Notifications/Notifications";
import SidebarCreateWorkspaceModal from "~/Combonents/Modal/SidebarCreateWorkspaceModal";
import { startSignalR } from "~/socketClient";

// Simple icon components to avoid lucide-react dependency
const Icon = ({ d, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const IconGrid = () => (
  <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
);
const IconBoard = () => (
  <Icon d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
);
const IconSettings = () => (
  <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
);
const IconLogout = () => (
  <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
);
const IconChevronDown = () => <Icon d="M6 9l6 6 6-6" size={14} />;
const IconChevronRight = () => <Icon d="M9 18l6-6-6-6" size={14} />;
const IconPlus = () => <Icon d="M12 5v14M5 12h14" />;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const { currentActiveBoard: activeBoard } = useBoardStore();
  const workspaces = useSelector(selectWorkspaces);
  const activeWorkspace = useSelector(selectActiveWorkspace);

  useEffect(() => {
    startSignalR();
  }, []);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchWorkspacesThunk());
    }
  }, [currentUser, dispatch]);

  const [expandedBoards, setExpandedBoards] = useState(true);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState(true);
  const [isCreateWorkspaceModalOpen, setCreateWorkspaceModalOpen] =
    useState(false);

  const pathMatch = location.pathname.match(/\/boards\/([^/]+)/);
  const currentBoardId = pathMatch ? pathMatch[1] : null;

  const getActiveView = () => {
    if (location.pathname === "/dashboard") return "dashboard";
    if (location.pathname === "/boards") return "boards";
    if (location.pathname.includes("/settings")) return "settings";
    if (currentBoardId) return "board";
    return "dashboard";
  };
  const activeView = getActiveView();

  const handleLogout = () => {
    dispatch(logoutUserAPI());
  };

  const initials = (name) => name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="sidebar-logo">✦ Trole</span>
          <Notifications />
        </div>

        <nav className="sidebar-nav">
          {/* Main nav */}
          <div className="sidebar-section">
            <button
              className={`sidebar-item ${activeView === "dashboard" ? "active" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              <IconGrid />
              <span style={{ flex: 1 }}>Dashboard</span>
            </button>
            <button
              className={`sidebar-item ${activeView === "boards" ? "active" : ""}`}
              onClick={() => navigate("/boards")}
            >
              <IconBoard />
              <span style={{ flex: 1 }}>My Boards</span>
            </button>
          </div>

          {/* Workspaces Section */}
          <div className="sidebar-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                className="sidebar-section-toggle"
                onClick={() => setExpandedWorkspaces((v) => !v)}
                style={{ flex: 1 }}
              >
                {expandedWorkspaces ? (
                  <IconChevronDown />
                ) : (
                  <IconChevronRight />
                )}
                Workspaces
              </button>
              <button
                className="btn btn-icon btn-ghost"
                style={{ width: 24, height: 24 }}
                onClick={() => setCreateWorkspaceModalOpen(true)}
                title="Create Workspace"
              >
                <IconPlus />
              </button>
            </div>

            {expandedWorkspaces && workspaces && (
              <div style={{ marginTop: 4 }}>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    className={`sidebar-item ${activeWorkspace?.id === ws.id && activeView === "boards" ? "active" : ""}`}
                    onClick={() => {
                      dispatch(fetchActiveWorkspaceThunk(ws.id));
                      navigate("/boards");
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 3,
                        background: "var(--accent-gradient)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ws.name}
                    </span>
                  </button>
                ))}
                {workspaces.length === 0 && (
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    No workspaces yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current board */}
          {activeBoard && currentBoardId && (
            <div className="sidebar-section">
              <button
                className="sidebar-section-toggle"
                onClick={() => setExpandedBoards((v) => !v)}
              >
                {expandedBoards ? <IconChevronDown /> : <IconChevronRight />}
                Current Board
              </button>
              {expandedBoards && (
                <button
                  className="sidebar-item active"
                  onClick={() => navigate(`/boards/${currentBoardId}`)}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: "var(--accent-gradient)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeBoard.title}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Settings */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Account</div>
            <button
              className={`sidebar-item ${activeView === "settings" ? "active" : ""}`}
              onClick={() => navigate("/settings/account")}
            >
              <IconSettings />
              Settings
            </button>
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{initials(currentUser?.displayName)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentUser?.displayName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentUser?.email}
            </div>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            onClick={handleLogout}
            title="Logout"
          >
            <IconLogout />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <SidebarCreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setCreateWorkspaceModalOpen(false)}
      />
    </div>
  );
}
