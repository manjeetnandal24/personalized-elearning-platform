import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { fetchDashboardData } from "../api/dashboardApi";
import { updateProfileName } from "../api/profileApi";
import BackendStatus from "../components/BackendStatus";
import { useAuth } from "../context/AuthContext";
import type { DashboardData } from "../types/dashboard";

function StudentProfilePage() {
  const { user, token, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  const [displayName, setDisplayName] = useState(user?.name || "");
  const [nameForm, setNameForm] = useState(user?.name || "");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    async function loadProfileStats() {
      if (!token) {
        setErrorMessage("Login token is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchDashboardData(token);
        setDashboardData(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load profile stats.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileStats();
  }, [token]);

  async function handleUpdateName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setProfileMessage("");
      setErrorMessage("Login token is missing.");
      return;
    }

    const trimmedName = nameForm.trim();

    if (trimmedName.length < 2) {
      setProfileMessage("");
      setErrorMessage("Name must be at least 2 characters.");
      return;
    }

    try {
      setIsSavingName(true);
      setProfileMessage("");
      setErrorMessage("");

      const updatedUser = await updateProfileName(trimmedName, token);

      setDisplayName(updatedUser.name);
      setNameForm(updatedUser.name);
      setProfileMessage(
        "Profile name updated successfully. Refresh once if sidebar still shows old name.",
      );
    } catch (error) {
      setProfileMessage("");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update name.",
      );
    } finally {
      setIsSavingName(false);
    }
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="small-heading">STUDENT PROFILE</p>
        <h1>My Profile</h1>
        <p>View your account details, learning progress and quick actions.</p>
      </div>

      <BackendStatus />

      {isLoading && <p className="status-text">Loading profile...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {profileMessage && <p className="status-text">{profileMessage}</p>}

      {!isLoading && !errorMessage && dashboardData && (
        <>
          <div className="profile-layout">
            <div className="profile-main-card">
              <div className="profile-avatar-large">
                {displayName.charAt(0).toUpperCase() || "S"}
              </div>

              <div>
                <p className="small-heading">ACCOUNT DETAILS</p>
                <h2>{displayName}</h2>
                <p>{user?.email}</p>

                <span className="profile-role-badge">{user?.role}</span>
              </div>
            </div>

            <div className="profile-settings-card">
              <p className="small-heading">ACCOUNT SETTINGS</p>
              <h2>Edit Profile</h2>
              <p>Update your student display name.</p>

              <form className="profile-edit-form" onSubmit={handleUpdateName}>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={nameForm}
                    onChange={(event) => setNameForm(event.target.value)}
                    placeholder="Enter your name"
                  />
                </label>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSavingName}
                >
                  {isSavingName ? "Saving..." : "Save Name"}
                </button>
              </form>

              <div className="profile-action-grid">
                <Link to="/dashboard/courses" className="secondary-button">
                  My Courses
                </Link>

                <Link to="/dashboard/quizzes" className="secondary-button">
                  Quiz Results
                </Link>

                <Link to="/dashboard/certificates" className="secondary-button">
                  Certificates
                </Link>

                <button
                  type="button"
                  className="danger-button"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <p>Enrolled Courses</p>
              <h2>{dashboardData.enrolledCourses}</h2>
            </div>

            <div className="dashboard-card">
              <p>Completed Lessons</p>
              <h2>{dashboardData.completedLessons}</h2>
            </div>

            <div className="dashboard-card">
              <p>Overall Progress</p>
              <h2>{dashboardData.overallProgress}%</h2>
            </div>

            <div className="dashboard-card">
              <p>Quiz Attempts</p>
              <h2>{dashboardData.quizAnalytics.totalAttempts}</h2>
            </div>

            <div className="dashboard-card">
              <p>Average Quiz Score</p>
              <h2>{dashboardData.quizAnalytics.averageScore}%</h2>
            </div>

            <div className="dashboard-card">
              <p>Passed Attempts</p>
              <h2>{dashboardData.quizAnalytics.passedAttempts}</h2>
            </div>
          </div>

          <div className="admin-overview-actions">
            <Link to="/courses" className="admin-overview-card">
              <span>📚</span>
              <h3>Browse Courses</h3>
              <p>Explore new courses and continue learning.</p>
            </Link>

            <Link to="/dashboard/courses" className="admin-overview-card">
              <span>🎯</span>
              <h3>Learning Progress</h3>
              <p>Check your enrolled courses and progress.</p>
            </Link>

            <Link to="/dashboard/certificates" className="admin-overview-card">
              <span>🏆</span>
              <h3>Certificates</h3>
              <p>View unlocked certificates and eligibility status.</p>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default StudentProfilePage;