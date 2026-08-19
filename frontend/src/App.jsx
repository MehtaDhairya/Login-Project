import { useState } from "react";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingName, setEditingName] = useState("");


  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditingName(user.name);
  };
  const handleSave = async (userId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update user.");
      }

      setEditingUserId(null);
      setEditingName("");

      await fetchUsers();

      setMessage("User updated successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingName("");
  };
  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete user.");
      }

      await fetchUsers();

      setMessage("User deleted successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("BUTTON CLICKED");

    const endpoint = isLogin ? "login" : "register";

    const body = isLogin
      ? {
        email: email,
        password: password,
      }
      : {
        name: name,
        email: email,
        password: password,
      };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || data.message || "Something went wrong.");
        return;
      }

      setMessage(data.message);

      if (isLogin) {
        setLoggedIn(true);
        await fetchUsers();
      }
    } catch (error) {
      setMessage("Something went wrong.");
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/users");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch users.");
      }

      setUsers(data);
    } catch (error) {
      setMessage(error.message);
    }
  };
  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div>
      <h1>{isLogin ? "Login" : "Register"}</h1>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        {isLogin
          ? "Don't have an account?"
          : "Already have an account?"}

        <button type="button" onClick={switchMode}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
      {loggedIn && (
        <div>
          <h2>User Management</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {editingUserId === user.id ? (
                      <>
                        <button onClick={() => handleSave(user.id)}>
                          Save
                        </button>

                        <button onClick={handleCancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(user)}>
                          Edit
                        </button>

                        <button onClick={() => handleDelete(user.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

  );
}

export default App;