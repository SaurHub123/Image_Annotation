// const KEY = "kp_skeletons";

// export const loadSkeletons = () => {
//   try {
//     return JSON.parse(localStorage.getItem(KEY)) || [];
//   } catch {
//     return [];
//   }
// };

// export const saveSkeletons = (skeletons) => {
//   localStorage.setItem(KEY, JSON.stringify(skeletons));
// };



// utils/skeletonStorage.js
const KEY = "skeletons";

export const loadSkeletons = () =>
  JSON.parse(localStorage.getItem(KEY) || "[]");

export const saveSkeletons = (list) =>
  localStorage.setItem(KEY, JSON.stringify(list));
