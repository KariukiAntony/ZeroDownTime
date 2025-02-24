import { useEffect, useState } from "react";

// types for API responses
interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiData {
  _version: string;
  _host: string;
  _time: string;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const frontendVersion = "v1.0.1";

  const baseUrl = `http://164.92.165.41/api`;

  useEffect(() => {
    // Fetch users from backend
    fetch(`${baseUrl}/users`)
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
      })
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch backend info
    fetch(`${baseUrl}/healthcheck`)
      .then((res) => res.json())
      .then((data: ApiData) => {
        setApiData(data);
      })
      .catch((err) => console.error("Error fetching backend version:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Frontend Info</h2>
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-lg">
        <p><strong>Frontend Version:</strong> {frontendVersion}</p>
      </div>

      <h2 className="text-3xl font-bold text-blue-600 mb-4 mt-4">Backend Info</h2>
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-lg">
        {apiData ? (
          <>
            <p><strong>Backend Version:</strong> {apiData._version}</p>
            <p><strong>Host:</strong> {apiData._host}</p>
            <p><strong>Time:</strong> {apiData._time}</p>
          </>
        ) : (
          <p className="text-gray-500">Loading data...</p>
        )}
      </div>

      <h2 className="text-3xl font-bold text-blue-600 mb-4 mt-4">User List</h2>
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-3">Users</h2>
        <ul>
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.id} className="border-b p-2">
                <strong>{user.name}</strong> - {user.email}
              </li>
            ))
          ) : (
            <p className="text-gray-500">Loading users...</p>
          )}
        </ul>
      </div>
    </div>
  );
}
