// types/catalog.ts
// Matches the verbatim response of GET /courses (list). Confirmed
// against a real payload — do not "complete" this shape from domain.ts
// assumptions; it deliberately omits fields that endpoint doesn't join.
//
// Confirmed facts about this endpoint:
// - Top-level envelope is PaginatedResponse<CourseCatalogItem> from
//   types/api.ts: { success, data: CourseCatalogItem[], meta }.
//   NOT { data: { courses: [...] } }.
// - No `instructor` object is joined — only `instructorId`. If cards
//   need an instructor name, either fetch it separately or ask the
//   backend to join it here; don't assume it'll show up.
// - `programs` is a plural array of { position, program }, since a
//   course can belong to zero, one, or multiple programs. There is no
//   singular `program` field.
// - No `moduleCount` / `modules` — this endpoint doesn't return
//   curriculum depth at all.
// - Pricing entries here are a TRIMMED subset of CoursePricing: no
//   sortOrder, isActive, courseId, or createdAt. Treat every pricing
//   returned by this endpoint as already sale-eligible — there is no
//   isActive flag to filter by client-side.

import type { Course, CoursePricing, InstructorSummary, ModuleWithTopics } from "./domain";

export interface CourseCatalogProgramRef {
  position: number;
  program: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface CourseCatalogPricing {
  id: string;
  name: string | null;
  price: string;
  currency: string;
  isFree: boolean;
  accessDurationDays: number | null;
}

export interface CourseCatalogItem
  extends Pick<
    Course,
    | "id"
    | "title"
    | "slug"
    | "code"
    | "description"
    | "thumbnail"
    | "level"
    | "tags"
    | "status"
    | "issuesCertificate"
    | "totalDurationSeconds"
    | "createdAt"
    | "updatedAt"
    | "instructorId"
  > {
  pricings: CourseCatalogPricing[];
  programs: CourseCatalogProgramRef[];
}

/**
 * ⚠️ PROVISIONAL — GET /courses/slug/:courseSlug (standalone detail) has
 * not been confirmed against a real payload the way the list endpoint
 * was. Reusing CourseCatalogItem's shape as a safe minimum (every field
 * on it is confirmed to exist somewhere in the API), NOT because the
 * detail endpoint is known to return exactly this. Replace with a
 * proper confirmed type the moment a real response is available —
 * in particular, curriculum/module data almost certainly lives on the
 * real detail payload and isn't represented here yet.
 */
export type CourseDetailItem = CourseCatalogItem;

/**
 * ⚠️ INFERRED FROM WORKING CODE, NOT A RAW CONFIRMED PAYLOAD — reconstructed
 * from the fields CoursePage/Curriculum/PricingCard actually read. Replace
 * with a properly confirmed type the moment a real
 * GET /courses/slug/:programSlug/:courseSlug response is available. Open
 * questions this doesn't resolve:
 * - Do pricings here include isActive/sortOrder/courseId/createdAt (full
 *   CoursePricing, assumed below) or the list endpoint's trimmed subset?
 * - Is `programs` really plural here too, or does this endpoint return
 *   something else since programSlug is already in the URL?
 * - Do topics nest `videoAsset`/`resources` relations, or does TopicRow.tsx
 *   (not reviewed) still expect the old flattened bunnyVideoId/videoStatus
 *   shape? That component needs a look before trusting this end-to-end.
 */
export interface CoursePublicDetail
  extends Pick<
    Course,
    | "id"
    | "title"
    | "slug"
    | "description"
    | "thumbnail"
    | "videoPreview"
    | "level"
    | "tags"
    | "totalDurationSeconds"
    | "createdAt"
    | "instructorId"
  > {
  modules: ModuleWithTopics[];
  pricings: CoursePricing[];
  programs: CourseCatalogProgramRef[];
  instructor: InstructorSummary | null;
}

/** Grouping shape for the catalog page — program is the trimmed ref, not the full domain Program. */
export interface CatalogProgramGroup {
  program: CourseCatalogProgramRef["program"] | null;
  courses: CourseCatalogItem[];
}

/**
 * ⚠️ UNCONFIRMED — modeled on the list endpoint + schema, not verified
 * against a real GET/POST/PATCH /courses/:id payload the way
 * CourseCatalogItem was. Admin detail/create/update responses commonly
 * return the full model rather than the list endpoint's trimmed
 * pricing subset — confirm before relying on sortOrder/isActive/instructor
 * actually being present.
 */
export interface CourseAdminDetail extends Course {
  instructor: InstructorSummary | null;
  pricings: CoursePricing[];
  programs: CourseCatalogProgramRef[];
}