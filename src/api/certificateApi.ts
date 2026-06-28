const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type CertificateTemplate = {
  id: number;
  courseId: number;
  title: string;
  subtitle: string;
  bodyText: string;
  footerText: string;
  signatoryName: string;
  signatoryTitle: string;
  brandColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CertificateTemplateForm = {
  title: string;
  subtitle: string;
  bodyText: string;
  footerText: string;
  signatoryName: string;
  signatoryTitle: string;
  brandColor: string;
  isActive: boolean;
};

export type AdminCertificateTemplateResponse = {
  courseId: number;
  courseTitle: string;
  courseShortName: string;
  template: CertificateTemplate | null;
};

export type IssuedCertificate = {
  id: number;
  certificateCode: string;
  userId: number;
  courseId: number;
  issuedAt: string;
};

export type StudentCertificateStatus = {
  student: {
    id: number;
    name: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
    shortName: string;
    instructor: string;
  };
  enrolledAt: string;
  isEligible: boolean;
  hasActiveTemplate: boolean;
  certificate: IssuedCertificate | null;
  template: CertificateTemplate | null;
  lessons: {
    totalLessons: number;
    completedLessons: number;
    lessonProgressPercentage: number;
    lessonsCompleted: boolean;
  };
  quizzes: {
    totalQuizzes: number;
    passedQuizzes: number;
    quizzesCompleted: boolean;
    quizResults: {
      quizId: number;
      quizTitle: string;
      passingScore: number;
      isPassed: boolean;
      bestScore: number | null;
    }[];
  };
};

export async function fetchAdminCertificateTemplate(
  courseId: number,
  token: string,
): Promise<AdminCertificateTemplateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/certificates/admin/templates/courses/${courseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load certificate template.");
  }

  return data.data;
}

export async function saveAdminCertificateTemplate(
  courseId: number,
  payload: CertificateTemplateForm,
  token: string,
): Promise<CertificateTemplate> {
  const response = await fetch(
    `${API_BASE_URL}/certificates/admin/templates/courses/${courseId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to save certificate template.");
  }

  return data.data.template;
}

export async function fetchStudentCertificateStatus(
  courseId: number,
  token: string,
): Promise<StudentCertificateStatus> {
  const response = await fetch(
    `${API_BASE_URL}/certificates/courses/${courseId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load certificate status.");
  }

  return data.data;
}