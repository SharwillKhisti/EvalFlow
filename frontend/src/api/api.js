const API_BASE = import.meta.env.VITE_API_URL;

export async function getCourses() {
  const res = await fetch(`${API_BASE}/courses`);
  return res.json();
}