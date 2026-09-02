import type { CampusNewsItem } from "@/features/news/types/campus-news";

export const mockCampusNews = [
  {
    id: "academic-calendar-revision",
    type: "announcement",
    title: "Revised academic calendar published for the current term",
    summary:
      "Students and faculty members are asked to review the updated class, examination, and term-break dates.",
    content: [
      "A revised academic calendar for the current term is now available. The update aligns the remaining teaching weeks, preparatory leave, examinations, and term break within one consolidated schedule.",
      "Students should check the dates relevant to their series and department. Faculty members are requested to use the revised timeline when planning remaining classes and academic activities.",
      "This is prototype content for the UniCircle frontend. The final application will display information published and verified by the authorized CUET office.",
    ],
    publishedAt: "2026-09-03T09:30:00+06:00",
    publishedBy: "Office of the Registrar",
    audience: "All students and faculty",
  },
  {
    id: "robotics-team-national-final",
    type: "news",
    title: "Student robotics team selected for national innovation final",
    summary:
      "A multidisciplinary CUET student team has advanced with its autonomous inspection prototype.",
    content: [
      "A multidisciplinary student robotics team has been selected for the final round of a national innovation programme with an autonomous inspection prototype designed for constrained environments.",
      "The team will refine its navigation and sensing workflow before the final presentation. Students from several departments contributed to mechanical design, embedded systems, and software integration.",
      "This sample story demonstrates how campus achievements can be presented in UniCircle. Verified reports and official publication details will replace prototype content after backend integration.",
    ],
    publishedAt: "2026-09-02T16:10:00+06:00",
    publishedBy: "CUET News Desk",
    audience: "CUET community",
  },
  {
    id: "library-hours-extended",
    type: "update",
    title: "Central library weekday service extended until 9:00 PM",
    summary:
      "The extended prototype schedule gives students additional evening reading and reference time.",
    content: [
      "The central library weekday service window has been extended until 9:00 PM in this prototype update. Reading spaces and the reference desk will remain available during the extended period.",
      "Users should complete borrowing and return procedures before the announced service cutoff. Any temporary change to the schedule will be communicated through the news and notification sections.",
      "Final operating hours will come from the authorized library administration when UniCircle is connected to its backend service.",
    ],
    publishedAt: "2026-09-01T15:45:00+06:00",
    publishedBy: "Central Library",
    audience: "Students, teachers, and staff",
  },
  {
    id: "freshers-orientation-schedule",
    type: "announcement",
    title: "Freshers’ orientation programme schedule available",
    summary:
      "New students can review the reporting time, venue guidance, and programme sequence for orientation day.",
    content: [
      "The orientation programme schedule for incoming students is available through this prototype announcement. The programme includes welcome sessions, academic guidance, and introductions to key campus services.",
      "Students should arrive before the stated reporting time and carry their required university documents. Department-specific instructions will be communicated by the relevant offices.",
      "The final schedule and venue information must be verified by the authorized CUET administration before production publication.",
    ],
    publishedAt: "2026-08-30T10:00:00+06:00",
    publishedBy: "Student Welfare Office",
    audience: "Incoming students",
  },
  {
    id: "water-supply-maintenance",
    type: "update",
    title: "Planned water-supply maintenance for residential halls",
    summary:
      "A short service interruption is planned while routine maintenance is completed on the distribution line.",
    content: [
      "Routine maintenance is planned for a section of the residential water-distribution line. A short service interruption may affect selected halls during the announced maintenance window.",
      "Residents are advised to keep a reasonable amount of water available beforehand and avoid unnecessary storage. Service is expected to return gradually after the work is completed.",
      "The schedule in this frontend prototype is illustrative. Production updates will be issued only by an authorized campus office.",
    ],
    publishedAt: "2026-08-28T17:20:00+06:00",
    publishedBy: "Engineering & Maintenance Office",
    audience: "Residential students",
  },
  {
    id: "inter-department-debate-results",
    type: "news",
    title: "Inter-department debate concludes with a closely contested final",
    summary:
      "The campus competition brought together student teams for several rounds of structured debate.",
    content: [
      "The inter-department debate programme concluded after several preliminary rounds and a closely contested final. Participating students presented arguments on contemporary technology and public-policy topics.",
      "Organizers thanked the adjudicators, volunteers, and participating departments for supporting an inclusive campus event.",
      "This prototype story illustrates the serial news format. Confirmed results and participant information will be supplied by the relevant organizer in the connected application.",
    ],
    publishedAt: "2026-08-25T19:15:00+06:00",
    publishedBy: "CUET News Desk",
    audience: "CUET community",
  },
] as const satisfies readonly CampusNewsItem[];
