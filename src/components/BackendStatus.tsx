import { useEffect, useState } from "react";

type HealthResponse = {
  success: boolean;
  message: string;
};

function BackendStatus() {
  const [status, setStatus] = useState("Checking backend...");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/health",
        );

        if (!response.ok) {
          throw new Error("Backend returned an error");
        }

        const data: HealthResponse = await response.json();

        setStatus(data.message);
        setIsConnected(data.success);
      } catch {
        setStatus("Backend is not connected");
        setIsConnected(false);
      }
    }

    checkBackend();
  }, []);

  return (
    <div
      className={
        isConnected
          ? "backend-status connected-status"
          : "backend-status disconnected-status"
      }
    >
      <span className="status-dot"></span>
      <p>{status}</p>
    </div>
  );
}

export default BackendStatus;