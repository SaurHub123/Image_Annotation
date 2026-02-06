// utils/skeletonStorage.js
const KEY = "skeletons";

export const loadSkeletons = () =>
  JSON.parse(localStorage.getItem(KEY) || "[]");

export const saveSkeletons = (list) =>
  localStorage.setItem(KEY, JSON.stringify(list));
