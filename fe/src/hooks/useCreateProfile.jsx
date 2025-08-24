import React from 'react';
import axios from 'axios';
import { useMutation } from "@tanstack/react-query"
import { api } from "../api/fetcher"

const createProfile = async (profileData) => {
    const token = localStorage.getItem("accessToken")

    try {
        const res = await axios.post("/api/profile/create/", profileData, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return res.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const useCreateProfile = () => {
  return useMutation({
    mutationFn: (profileData) => createProfile(profileData),
    onSuccess: (data) =>  {
        console.log(data)
    },
    onError: (error) => {
        console.log("status:", error.response?.status);
        console.log("data:", error.response?.data);
    }
  })
};

export default useCreateProfile;