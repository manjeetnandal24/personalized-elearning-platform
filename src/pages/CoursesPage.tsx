import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchCourses } from "../api/courseApi";
import BackendStatus from "../components/BackendStatus";
import type { Course } from "../types/course";

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch {
        setErrorMessage("Unable to load courses. Please check backend server.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  const levels = useMemo(() => {
    const uniqueLevels = new Set(courses.map((course) => course.level));
    return ["All", ...Array.from(uniqueLevels)];
  }, [courses]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      courses.map((course) => course.category || "General"),
    );

    return ["All", ...Array.from(uniqueCategories)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.description.toLowerCase().includes(normalizedSearch) ||
        course.instructor.toLowerCase().includes(normalizedSearch) ||
        course.level.toLowerCase().includes(normalizedSearch) ||
        (course.category || "General").toLowerCase().includes(normalizedSearch);

      const matchesLevel =
        selectedLevel === "All" || course.level === selectedLevel;

      const matchesCategory =
        selectedCategory === "All" ||
        (course.category || "General") === selectedCategory;

      return matchesSearch && matchesLevel && matchesCategory;
    });

    if (sortBy === "Title") {
      return [...filtered].sort((firstCourse, secondCourse) =>
        firstCourse.title.localeCompare(secondCourse.title),
      );
    }

    if (sortBy === "Lessons") {
      return [...filtered].sort(
        (firstCourse, secondCourse) =>
          secondCourse.lessons.length - firstCourse.lessons.length,
      );
    }

    return filtered;
  }, [courses, searchQuery, selectedLevel, selectedCategory, sortBy]);

  function resetFilters() {
    setSearchQuery("");
    setSelectedLevel("All");
    setSelectedCategory("All");
    setSortBy("Newest");
  }

  return (
    <section className="courses-page">
      <div className="courses-hero">
        <div>
          <p className="small-heading">COURSE CATALOG</p>
          <h1>Explore Courses</h1>
          <p>
            Search, filter and browse courses by level, category and learning
            goals.
          </p>
        </div>
      </div>

      <BackendStatus />

      <div className="course-filter-panel">
        <div className="course-search-box">
          <label>
            Search Courses
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, category, instructor..."
            />
          </label>
        </div>

        <div className="course-filter-grid">
          <label>
            Level
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
            >
              {levels.map((level) => (
                <option value={level} key={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label>
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort By
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="Newest">Newest</option>
              <option value="Title">Title</option>
              <option value="Lessons">Most Lessons</option>
            </select>
          </label>

          <button
            type="button"
            className="secondary-button course-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="course-result-summary">
        <p>
          Showing <strong>{filteredCourses.length}</strong> of{" "}
          <strong>{courses.length}</strong> courses
        </p>
      </div>

      {isLoading && <p className="status-text">Loading courses...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && filteredCourses.length === 0 && (
        <div className="empty-dashboard-card">
          <h2>No courses found</h2>
          <p>Try changing your search keyword, level or category filter.</p>

          <button
            type="button"
            className="course-link dashboard-login-link"
            onClick={resetFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && filteredCourses.length > 0 && (
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-card-top">
                <div className="course-icon">{course.shortName}</div>

                <div className="course-badge-group">
                  <span>{course.level}</span>
                  <span>{course.category || "General"}</span>
                </div>
              </div>

              <h2>{course.title}</h2>

              <p>{course.description}</p>

              <div className="course-meta-row">
                <span>{course.lessons.length} lessons</span>
                <span>{course.topics.length} topics</span>
              </div>

              <p className="course-instructor">
                Instructor: <strong>{course.instructor}</strong>
              </p>

              <Link to={`/courses/${course.id}`} className="course-link">
                View Course
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CoursesPage;