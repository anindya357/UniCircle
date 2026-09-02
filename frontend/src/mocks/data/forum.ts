import type {
  ForumAuthor,
  ForumPost,
  ForumSnapshot,
} from "@/features/forum/types/forum";

const authors = {
  anika: {
    id: "forum-user-anika",
    displayName: "Anika Rahman",
    username: "anika.rahman",
    role: "student",
    academicUnit: "Computer Science & Engineering · 20 Series",
  },
  rafid: {
    id: "forum-user-rafid",
    displayName: "Rafid Hasan",
    username: "rafid.hasan",
    role: "student",
    academicUnit: "Mechanical Engineering · 21 Series",
  },
  nusrat: {
    id: "forum-user-nusrat",
    displayName: "Nusrat Jahan",
    username: "nusrat.jahan",
    role: "student",
    academicUnit: "Urban & Regional Planning · 19 Series",
  },
  farzana: {
    id: "forum-user-farzana",
    displayName: "Dr. Farzana Karim",
    username: "farzana.karim",
    role: "teacher",
    academicUnit: "Department of Civil Engineering",
  },
  mahmud: {
    id: "forum-user-mahmud",
    displayName: "Mahmudul Islam",
    username: "mahmud.islam",
    role: "staff",
    academicUnit: "Central Library",
  },
} as const satisfies Record<string, ForumAuthor>;

export const mockForumPosts = [
  {
    id: "forum-post-library-hours",
    author: authors.nusrat,
    body: "Could the central library keep one reading room open a little longer during term-final weeks? Many students have evening lab sessions, and finding a quiet place afterward is difficult. I would like to know whether others face the same issue before we prepare a request.",
    createdAt: "2026-09-02T14:20:00+06:00",
    comments: [
      {
        id: "forum-comment-library-1",
        postId: "forum-post-library-hours",
        author: authors.mahmud,
        body: "Thanks for raising this constructively. The current closing time is tied to staffing, but I can share the request with the library office if students submit an estimated demand.",
        createdAt: "2026-09-02T14:46:00+06:00",
      },
      {
        id: "forum-comment-library-2",
        postId: "forum-post-library-hours",
        author: authors.anika,
        body: "This would help our project groups too. A short form to estimate the number of students could give the office useful evidence.",
        createdAt: "2026-09-02T15:05:00+06:00",
      },
    ],
  },
  {
    id: "forum-post-water-station",
    author: authors.rafid,
    body: "The drinking-water point beside the workshop block has been out of service since yesterday afternoon. Does anyone know whether it has already been reported, or which campus office should receive the maintenance request?",
    createdAt: "2026-09-02T11:10:00+06:00",
    comments: [
      {
        id: "forum-comment-water-1",
        postId: "forum-post-water-station",
        author: authors.farzana,
        body: "Please inform the engineering office with the exact block location. I have also forwarded the issue through our department office.",
        createdAt: "2026-09-02T11:42:00+06:00",
      },
    ],
  },
  {
    id: "forum-post-pedestrian-safety",
    author: authors.farzana,
    body: "A reminder for everyone using the road between the academic buildings and the halls after sunset: please keep the pedestrian side clear and avoid gathering at the narrow turn. What small, practical improvements would make that crossing safer for everyone?",
    createdAt: "2026-09-01T18:35:00+06:00",
    comments: [
      {
        id: "forum-comment-safety-1",
        postId: "forum-post-pedestrian-safety",
        author: authors.nusrat,
        body: "Reflective lane markers and one additional light near the turn would improve visibility without changing the road layout.",
        createdAt: "2026-09-01T19:02:00+06:00",
      },
      {
        id: "forum-comment-safety-2",
        postId: "forum-post-pedestrian-safety",
        author: authors.rafid,
        body: "A painted pedestrian edge would also make the walking space clearer during busy hours.",
        createdAt: "2026-09-01T19:18:00+06:00",
      },
    ],
  },
  {
    id: "forum-post-study-circle",
    author: authors.anika,
    body: "I am planning a small weekly study circle for students who want to practise algorithms and problem solving together. It would be beginner-friendly and focused on explaining approaches, not only solutions. Which weekday evening works best for interested students?",
    createdAt: "2026-08-31T20:15:00+06:00",
    comments: [],
  },
] as const satisfies readonly ForumPost[];

export const mockForumSnapshot = {
  currentUser: authors.anika,
  posts: mockForumPosts,
} as const satisfies ForumSnapshot;
