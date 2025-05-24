import React, { useContext, useEffect, useRef, useState } from "react";
import { SidebarContext } from "../context/SidebarContext";
import {
  SearchIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  MenuIcon,
  OutlinePersonIcon,
  OutlineCogIcon,
  OutlineLogoutIcon,
} from "../icons";
import {
  Avatar,
  Input,
  Dropdown,
  DropdownItem,
  WindmillContext,
} from "@windmill/react-ui";
import { useAuth } from "../context/AuthContext";
import { useHistory, Link } from "react-router-dom";
import { showSuccessToast } from "./Toast";
import {
  getDatabase,
  ref,
  onValue,
  update,
  remove,
} from "firebase/database";
import dayjs from "dayjs";

function Header() {
  const { mode, toggleMode } = useContext(WindmillContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const { logout, getTokenInfo } = useAuth();
  const { username } = getTokenInfo();
  const history = useHistory();

  const [notifications, setNotifications] = useState([]);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const firstRender = useRef(true);
  const database = getDatabase();

  const handleNotificationsClick = () => {
    setIsNotificationsMenuOpen(true);
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(true);
  };

  const handleLogout = () => {
    logout();
    history.push("/login");
    showSuccessToast("You are signed out");
  };

  useEffect(() => {
    const notiRef = ref(database, `notifications/${username}`);

    const unsubscribe = onValue(notiRef, (snapshot) => {
      const data = snapshot.val();
      let newList = [];

      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          newList.push({ id: key, ...value });
        });

        newList.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (!firstRender.current && newList.length > notifications.length) {
        showSuccessToast("Bạn có thông báo mới");
      }

      setNotifications(newList);
      if (firstRender.current) firstRender.current = false;
    });

    return () => unsubscribe();
  }, []);

  const updateNoti = async (docId, payload) => {
    const updateRef = ref(database, `notifications/${username}/${docId}`);
    await update(updateRef, payload);
  };

  return (
    <header className="z-40 py-4 bg-white shadow-bottom dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* Mobile hamburger */}
        <button
          className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Search input */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <div className="relative w-full max-w-xl mr-6 focus-within:text-purple-500">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <SearchIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <Input
              className="pl-8 text-gray-700"
              placeholder="Search for projects"
              aria-label="Search"
            />
          </div>
        </div>

        <ul className="flex items-center flex-shrink-0 space-x-6">
          {/* Theme toggler */}
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-purple"
              onClick={toggleMode}
              aria-label="Toggle color mode"
            >
              {mode === "dark" ? (
                <SunIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </li>

          {/* Notifications */}
          <li className="relative">
            <button
              className="align-middle rounded-md"
              onMouseOver={handleNotificationsClick}
              aria-label="Notifications"
              aria-haspopup="true"
            >
              <BellIcon className="w-5 h-5" aria-hidden="true" />
              {notifications.some((n) => !n.isRead) && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1 -translate-y-1 bg-red-600 border-2 border-white rounded-full dark:border-gray-800"
                ></span>
              )}
            </button>

            <Dropdown
              align="right"
              isOpen={isNotificationsMenuOpen}
              onClose={() => setIsNotificationsMenuOpen(false)}
              className="overflow-hidden overflow-y-scroll max-h-64"
            >
              {notifications.map((n, i) => (
                <React.Fragment key={n.id}>
                  <DropdownItem
                    tag="div"
                    className="flex-col items-start"
                    onClick={() => {
                      if (!n.isRead) {
                        updateNoti(n.id, { isRead: true });
                        setNotifications((prev) =>
                          prev.map((p) =>
                            p.id === n.id ? { ...p, isRead: true } : p
                          )
                        );
                      }
                      if (n.type === "email") {
                        history.push("/app/emails");
                      } else {
                        history.push(`/app/order/add-order/${n.orderId}`);
                      }
                    }}
                  >
                    <div className="w-full">
                      <span>{n.title}</span>
                      {!n.isRead && (
                        <span
                          aria-hidden="true"
                          className="inline-block float-right w-3 h-3 bg-red-600 border-2 border-white rounded-full dark:border-gray-800"
                        ></span>
                      )}
                    </div>
                    <div className="w-full text-xs text-gray-500">
                      {dayjs(new Date(n.createdAt)).format("DD-MM-YYYY HH:mm")}
                    </div>
                  </DropdownItem>
                  {i !== notifications.length - 1 && (
                    <hr className="h-[1px] w-full bg-gray-400"></hr>
                  )}
                </React.Fragment>
              ))}
            </Dropdown>
          </li>

          {/* Profile menu */}
          <li className="relative">
            <button
              className="rounded-full"
              onMouseOver={handleProfileClick}
              aria-label="Account"
              aria-haspopup="true"
            >
              <Avatar
                className="align-middle"
                src="https://images.unsplash.com/photo-1502378735452-bc7d86632805?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=aa3a807e1bbdfd4364d1f449eaa96d82"
                alt=""
                aria-hidden="true"
              />
            </button>
            <Dropdown
              align="right"
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
            >
              <DropdownItem tag={Link} to="/app/profile" className="flex items-center">
                <OutlinePersonIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Trang cá nhân</span>
              </DropdownItem>

              <DropdownItem tag="a" href="#">
                <OutlineCogIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Settings</span>
              </DropdownItem>

              <DropdownItem onClick={handleLogout}>
                <OutlineLogoutIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Log out</span>
              </DropdownItem>
            </Dropdown>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
