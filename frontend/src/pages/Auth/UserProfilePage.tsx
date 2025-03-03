import React, { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [full_name, setFullName] = useState("");
  const [image, setImage] = useState("");
  const [profile, setProfile] = useState(null);
  const api = useAxios();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`api/users/${userId}/`);
        setUser(response.data.user);
        setProfile(response.data.profile);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, [userId]);

  if (!user || !profile) return <div>Loading...</div>;

  return (
    <div className="container mx-auto pt-16">
      <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3 mx-auto">
        <div className="flex flex-col   items-center">
          <img
            src={`http://127.0.0.1:8000/files${profile.image}`}
            className="w-32 h-full rounded-full"
            alt="Profile"
          />
          <div className="flex bg-gray-300 rounded-lg my-2 mt-2 py-2">
            <div className="flex-col bg-gray-300">
              <p className="text-white mt-2 bg-gray-500 rounded-lg px-2 py-1 mx-2">Full Name</p>
              <p className="text-white mt-2 bg-gray-500 rounded-lg px-2 py-1 mx-2">
                Username:
              </p>
              <p className="text-white mt-2 bg-gray-500 rounded-lg px-2 py-1 mx-2">Bio:</p>
              <p className="text-white mt-2 bg-gray-500 rounded-lg px-2 py-1 mx-2">Email:</p>
            </div>
            <div className="flex-col">
              <p className="text-white mt-2 bg-gray-700 rounded-lg px-2 py-1 mx-2">{profile.full_name}</p>
              <p className="text-white mt-2 bg-gray-700 rounded-lg px-2 py-1 mx-2">{user.username}</p>
              <p className="text-white mt-2 bg-gray-700 rounded-lg px-2 py-1 mx-2">{profile.bio}</p>
              <p className="text-white mt-2 bg-gray-700 rounded-lg px-2 py-1 mx-2">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserProfilePage;
