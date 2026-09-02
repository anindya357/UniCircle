import type { AdminSnapshot } from "@/features/admin/types/admin";

export const mockAdminSnapshot = {
  routes: [
    {
      id: "admin-route-regular",
      name: "Regular city route",
      stops: [
        "Bottoli Rail Station",
        "GEC",
        "Muradpur",
        "Bahaddarhat",
        "Rastar Matha",
        "CUET",
      ],
    },
    {
      id: "admin-route-chawkbazar",
      name: "Chawkbazar route",
      stops: [
        "Bottoli Rail Station",
        "Kotowali",
        "Chawkbazar",
        "Bahaddarhat",
        "Rastar Matha",
        "CUET",
      ],
    },
    {
      id: "admin-route-loop",
      name: "Rastar Matha return loop",
      stops: ["CUET", "Rastar Matha", "CUET"],
    },
  ],
  drivers: [
    {
      id: "admin-driver-karim",
      name: "Abdul Karim",
      phone: "+880 1711-240101",
      licenseNumber: "CTA-48201",
    },
    {
      id: "admin-driver-selim",
      name: "Mohammad Selim",
      phone: "+880 1711-240102",
      licenseNumber: "CTA-48202",
    },
    {
      id: "admin-driver-amin",
      name: "Nurul Amin",
      phone: "+880 1711-240103",
      licenseNumber: "CTA-48203",
    },
  ],
  schedules: [
    {
      id: "admin-schedule-morning",
      title: "Morning campus arrival",
      serviceDate: "2026-09-06",
      startTime: "07:00",
      endTime: "08:20",
      routeId: "admin-route-regular",
      driverId: "admin-driver-karim",
      busName: "Tista",
      recurrence: "weekly",
    },
    {
      id: "admin-schedule-midday",
      title: "Midday city return",
      serviceDate: "2026-09-06",
      startTime: "13:30",
      endTime: "15:00",
      routeId: "admin-route-loop",
      driverId: "admin-driver-selim",
      busName: "BRTC-1",
      recurrence: "weekly",
    },
    {
      id: "admin-schedule-evening",
      title: "Evening city departure",
      serviceDate: "2026-09-06",
      startTime: "16:15",
      endTime: "17:45",
      routeId: "admin-route-chawkbazar",
      driverId: "admin-driver-amin",
      busName: "Surma",
      recurrence: "monthly",
    },
  ],
  announcements: [
    {
      id: "admin-news-calendar",
      type: "announcement",
      title: "Revised academic calendar published for the current term",
      summary:
        "Students and faculty members should review the revised class and examination dates.",
      audience: "All students and faculty",
      status: "published",
      updatedAt: "2026-09-03T09:30:00+06:00",
    },
    {
      id: "admin-news-library",
      type: "update",
      title: "Central library weekday service extended until 9:00 PM",
      summary:
        "A draft service update prepared for students who need evening reading time.",
      audience: "Students, teachers, and staff",
      status: "draft",
      updatedAt: "2026-09-02T15:45:00+06:00",
    },
  ],
  reports: [
    {
      id: "report-water-post",
      postId: "forum-post-water-station",
      authorName: "Rafid Hasan",
      reportedBy: "Nusrat Jahan",
      reason: "Possible inaccurate service information",
      postBody:
        "The drinking-water point beside the workshop block has been out of service since yesterday afternoon. Does anyone know whether it has already been reported?",
      reportedAt: "2026-09-03T08:20:00+06:00",
      status: "open",
    },
    {
      id: "report-study-circle",
      postId: "forum-post-study-circle",
      authorName: "Anika Rahman",
      reportedBy: "Mahmudul Islam",
      reason: "Reported as repeated promotional content",
      postBody:
        "I am planning a small weekly study circle for students who want to practise algorithms and problem solving together.",
      reportedAt: "2026-09-02T21:10:00+06:00",
      status: "open",
    },
  ],
} as const satisfies AdminSnapshot;
