import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

import {
  createCourseResource,
  deleteCourseResource,
  fetchCourseResources,
  updateCourseResource,
  type CourseResource,
  type CourseResourcePayload,
  type CourseResourceType,
  type CourseWithResources,
} from "../api/courseResourcesApi";
import { useAuth } from "../context/AuthContext";

type ResourceForm = {
  courseId: string;
  title: string;
  description: string;
  resourceUrl: string;
  type: CourseResourceType;
};

const emptyResourceForm: ResourceForm = {
  courseId: "",
  title: "",
  description: "",
  resourceUrl: "",
  type: "LINK",
};

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getResourceIcon(type: CourseResourceType) {
  if (type === "PDF") {
    return "📄";
  }

  if (type === "VIDEO") {
    return "🎥";
  }

  if (type === "NOTE") {
    return "📝";
  }

  if (type === "OTHER") {
    return "📦";
  }

  return "🔗";
}

function CourseResourcesPage() {
  const { token, user, isAuthenticated, isAuthLoading } = useAuth();

  const [courses, setCourses] = useState<CourseWithResources[]>([]);
  const [resourceForm, setResourceForm] =
    useState<ResourceForm>(emptyResourceForm);

  const [editingResourceId, setEditingResourceId] = useState<number | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    CourseResourceType | "ALL"
  >("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canManageResources =
    user?.role === "ADMIN" || user?.role === "INSTRUCTOR";

  async function loadResources() {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchCourseResources(token);
      setCourses(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load course resources.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadResources();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const totalResources = useMemo(() => {
    return courses.reduce((total, course) => total + course.resources.length, 0);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return courses
      .map((course) => {
        const filteredResources = course.resources.filter((resource) => {
          const matchesType =
            selectedTypeFilter === "ALL" || resource.type === selectedTypeFilter;

          const matchesSearch =
            !normalizedSearch ||
            course.title.toLowerCase().includes(normalizedSearch) ||
            course.shortName.toLowerCase().includes(normalizedSearch) ||
            resource.title.toLowerCase().includes(normalizedSearch) ||
            resource.description.toLowerCase().includes(normalizedSearch) ||
            resource.createdBy.name.toLowerCase().includes(normalizedSearch);

          return matchesType && matchesSearch;
        });

        return {
          ...course,
          resources: filteredResources,
        };
      })
      .filter((course) => {
        if (course.resources.length > 0) {
          return true;
        }

        if (!normalizedSearch && selectedTypeFilter === "ALL") {
          return true;
        }

        return false;
      });
  }, [courses, searchQuery, selectedTypeFilter]);

  function resetForm() {
    setResourceForm(emptyResourceForm);
    setEditingResourceId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const payload: CourseResourcePayload = {
      courseId: Number(resourceForm.courseId),
      title: resourceForm.title,
      description: resourceForm.description,
      resourceUrl: resourceForm.resourceUrl,
      type: resourceForm.type,
    };

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingResourceId) {
        await updateCourseResource(token, editingResourceId, payload);
        setSuccessMessage("Resource updated successfully.");
      } else {
        await createCourseResource(token, payload);
        setSuccessMessage("Resource added successfully.");
      }

      resetForm();
      await loadResources();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save resource.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(courseId: number, resource: CourseResource) {
    setEditingResourceId(resource.id);
    setResourceForm({
      courseId: String(courseId),
      title: resource.title,
      description: resource.description,
      resourceUrl: resource.resourceUrl,
      type: resource.type,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(resource: CourseResource) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete resource "${resource.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteCourseResource(token, resource.id);
      setSuccessMessage("Resource deleted successfully.");
      await loadResources();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete resource.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading) {
    return <p className="status-text">Checking resource access...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">COURSE RESOURCES</p>
          <h1>Study Material</h1>
          <p>
            Access useful links, notes, PDFs, videos and course learning
            resources in one organized place.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading resources...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      {!isLoading && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Courses</p>
              <h2>{courses.length}</h2>
              <span>
                {user?.role === "STUDENT"
                  ? "Enrolled courses"
                  : "Manageable courses"}
              </span>
            </div>

            <div className="dashboard-card">
              <p>Resources</p>
              <h2>{totalResources}</h2>
              <span>Total study materials</span>
            </div>

            <div className="dashboard-card">
              <p>Access</p>
              <h2>{user?.role}</h2>
              <span>Your current role</span>
            </div>
          </div>

          {canManageResources && (
            <form className="resource-form-card" onSubmit={handleSubmit}>
              <div>
                <p className="small-heading">ADD STUDY MATERIAL</p>
                <h2>
                  {editingResourceId ? "Edit Resource" : "Create Resource"}
                </h2>
              </div>

              <div className="resource-form-grid">
                <label>
                  Course
                  <select
                    value={resourceForm.courseId}
                    onChange={(event) =>
                      setResourceForm((currentForm) => ({
                        ...currentForm,
                        courseId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Choose course</option>
                    {courses.map((course) => (
                      <option value={course.id} key={course.id}>
                        {course.title} ({course.shortName})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Type
                  <select
                    value={resourceForm.type}
                    onChange={(event) =>
                      setResourceForm((currentForm) => ({
                        ...currentForm,
                        type: event.target.value as CourseResourceType,
                      }))
                    }
                    required
                  >
                    <option value="LINK">Link</option>
                    <option value="PDF">PDF</option>
                    <option value="VIDEO">Video</option>
                    <option value="NOTE">Note</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>

                <label>
                  Title
                  <input
                    type="text"
                    value={resourceForm.title}
                    onChange={(event) =>
                      setResourceForm((currentForm) => ({
                        ...currentForm,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Example: React Hooks Notes"
                    required
                  />
                </label>
              </div>

              <label>
                Resource URL
                <input
                  type="url"
                  value={resourceForm.resourceUrl}
                  onChange={(event) =>
                    setResourceForm((currentForm) => ({
                      ...currentForm,
                      resourceUrl: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/resource"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  value={resourceForm.description}
                  onChange={(event) =>
                    setResourceForm((currentForm) => ({
                      ...currentForm,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Short details about this resource..."
                  rows={3}
                />
              </label>

              <div className="instructor-form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSaving}
                >
                  {editingResourceId ? "Update Resource" : "Add Resource"}
                </button>

                {editingResourceId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="student-management-toolbar">
            <label>
              Search Resources
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search course, resource, creator..."
              />
            </label>

            <label>
              Type
              <select
                value={selectedTypeFilter}
                onChange={(event) =>
                  setSelectedTypeFilter(
                    event.target.value as CourseResourceType | "ALL",
                  )
                }
              >
                <option value="ALL">All Types</option>
                <option value="LINK">Links</option>
                <option value="PDF">PDFs</option>
                <option value="VIDEO">Videos</option>
                <option value="NOTE">Notes</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <p>
              Showing <strong>{filteredCourses.length}</strong> courses
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No resources found</h2>
              <p>No study material matches your current search or filter.</p>
            </div>
          ) : (
            <div className="resource-course-list">
              {filteredCourses.map((course) => (
                <article className="resource-course-card" key={course.id}>
                  <div className="resource-course-header">
                    <div className="analytics-course-cell">
                      <div className="course-icon">{course.shortName}</div>

                      <div>
                        <p className="course-category-pill">
                          {course.category}
                        </p>
                        <h2>{course.title}</h2>
                        <span>
                          {course.level} • {course.resources.length} resources
                        </span>
                      </div>
                    </div>
                  </div>

                  {course.resources.length === 0 ? (
                    <p className="status-text left-status-text">
                      No resources added for this course yet.
                    </p>
                  ) : (
                    <div className="resource-grid">
                      {course.resources.map((resource) => (
                        <article className="resource-card" key={resource.id}>
                          <div className="resource-icon">
                            {getResourceIcon(resource.type)}
                          </div>

                          <div className="resource-card-content">
                            <p className="announcement-target-pill">
                              {resource.type}
                            </p>
                            <h3>{resource.title}</h3>

                            {resource.description && (
                              <p>{resource.description}</p>
                            )}

                            <div className="announcement-meta">
                              <span>By {resource.createdBy.name}</span>
                              <span>{resource.createdBy.role}</span>
                              <span>{formatDate(resource.createdAt)}</span>
                            </div>
                          </div>

                          <div className="resource-actions">
                            <a
                              href={resource.resourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="primary-button"
                            >
                              Open
                            </a>

                            {canManageResources && (
                              <>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() =>
                                    startEditing(course.id, resource)
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="danger-outline-button"
                                  onClick={() => handleDelete(resource)}
                                  disabled={isSaving}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default CourseResourcesPage;