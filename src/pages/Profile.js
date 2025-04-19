// src/pages/Profile.js
import React from "react";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { getTokenInfo } = useAuth();
  const { username, email, role } = getTokenInfo(); 
 

  return (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
        Thông tin cá nhân
      </h2>

      <div className="flex flex-col space-y-4">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Tên người dùng:
          </span>
          <p className="text-gray-900 dark:text-gray-100">{username}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Email:
          </span>
          <p className="text-gray-900 dark:text-gray-100">{email || "Không có"}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Vai trò:
          </span>
          <p className="text-gray-900 dark:text-gray-100">{role || "User"}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
