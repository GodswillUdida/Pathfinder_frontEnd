// types/domain.ts
// SINGLE SOURCE OF TRUTH for all backend domain shapes. Every other
// file (forms, admin inputs, dashboards) should import and narrow
// from here with Pick/Omit/Partial — never redeclare a model shape.
//
// Serialization: Decimal → string, BigInt → string, DateTime → ISO string.

// ============================================================
// ENUMS (verbatim casing — do not lowercase/relabel)
// ============================================================

export type ProgramStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PROFESSIONAL";

/** Lowercase in the backend — do not uppercase. */
export type Role = "student" | "instructor" | "admin" | "superadmin";

export type VideoProvider = "BUNNY" | "AWS" | "CLOUDFLARE" | "MUX";
export type VideoStatus = "QUEUED" | "PROCESSING" | "UPLOADED" | "READY" | "FAILED";
export type ResourceType = "PDF" | "EXCEL" | "WORD" | "TEMPLATE" | "LINK";
export type EnrollmentStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentGateway = "PAYSTACK" | "FLUTTERWAVE" | "STRIPE";
export type TopicResourceStatus = "QUEUED" | "PROCESSING" | "READY" | "FAILED";

// ============================================================
// IDENTITY
// ============================================================

export type InstructorSummary = {
  id: string;
  name: string | null;
  profileImage: string | null;
};

// ============================================================
// PROGRAM
// ============================================================

export interface Program {
  id: string;
  title: string;
  description: string;
  image: string | null;
  slug: string;
  status: ProgramStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Admin list view — no pricing here, Program has no pricing model. */
export interface ProgramWithCount extends Program {
  _count: { courses: number };
}

/** Join row. Order by `position`, never by array index. */
export interface ProgramCourse {
  // id: string;
  // programId: string;
  // courseId: string;
  position: number;
  course: Pick<Course, "id" | "title" | "slug" | "thumbnail" | "status" | "level" | "totalDurationSeconds">;
}

export interface ProgramCourseSummary {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  status: CourseStatus;
  level: CourseLevel | null;
  totalDurationSeconds: number;
  pricings?: CoursePricing[];
}

export interface ProgramDetail extends ProgramWithCount {
  courses: ProgramCourse[];
}

// ============================================================
// COURSE
// ============================================================

/**
 * No `programId` / `program` field — ProgramCourse is the only
 * Program ↔ Course link. If a component needs the parent program,
 * fetch it through ProgramCourse, don't add it here.
 */
export interface Course {
  id: string;
  title: string;
  slug: string;
  code: string;
  description: string;
  thumbnail: string | null;
  videoPreview: string | null;
  level: CourseLevel;
  tags: string[];
  status: CourseStatus;
  issuesCertificate: boolean;
  instructorId: string | null;
  /** Denormalized: SUM(Module.totalDurationSeconds). Read only. */
  totalDurationSeconds: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithInstructor extends Course {
  instructor: InstructorSummary | null;
}

export interface CourseWithModules extends CourseWithInstructor {
  modules: ModuleWithTopics[];
}

export interface CourseWithPricing extends CourseWithInstructor {
  pricings: CoursePricing[];
}

// ============================================================
// COURSE PRICING
// ============================================================

/**
 * `accessDurationDays` is the ONLY source of truth for access length.
 * null = lifetime. There is no isLifetime flag, no string-enum
 * duration ("SEVEN_DAYS" etc.) — that was a fabricated shape.
 */
export interface CoursePricing {
  id: string;
  courseId: string;
  name: string | null;
  /** Decimal serialized as string — Number(price) only for arithmetic. */
  price: string;
  isFree: boolean;
  currency: string;
  accessDurationDays: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

// ============================================================
// CURRICULUM: MODULE / TOPIC
// ============================================================

export interface Module {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  courseId: string;
  position: number;
  /** Denormalized: SUM(Topic.durationSeconds). Read only. */
  totalDurationSeconds: number;
  views: number;
  completions: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ModuleWithTopics extends Module {
  topics: TopicWithRelations[];
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  moduleId: string;
  position: number;
  /** Cache sourced from VideoAsset.durationSeconds for video topics. */
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Video and resources are RELATIONS, not inline fields. There is no
 * Topic.bunnyVideoId / Topic.videoStatus / Topic.resources: string[]
 * on the backend — those were flattening two other models onto Topic.
 */
export interface TopicWithRelations extends Topic {
  videoAsset: VideoAsset | null;
  resources: TopicResource[];
}

// ============================================================
// VIDEO / MEDIA
// ============================================================

export interface VideoAssetProviderData {
  bucket?: string;
  region?: string;
  playbackIds?: string[];
  libraryId?: string;
  streamUid?: string;
  [key: string]: unknown;
}

export interface VideoAsset {
  id: string;
  topicId: string;
  provider: VideoProvider;
  providerAssetId: string | null;
  status: VideoStatus;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  /** BigInt serialized as string. */
  fileSizeBytes: string | null;
  width: number | null;
  height: number | null;
  providerData: VideoAssetProviderData | null;
  retryCount: number;
  lastError: string | null;
  readyAt: string | null;
  createdAt: string;
  updatedAt: string;
  // No `playbackUrl` — resolved dynamically server-side. Don't cache one.
}

export interface TopicResource {
  id: string;
  topicId: string;
  type: ResourceType;
  title: string;
  storageKey: string | null;
  url: string | null;
  mimeType: string | null;
  status: TopicResourceStatus;
  retryCount: number;
  lastError: string | null;
  readyAt: string | null;
  sizeBytes: number | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ENROLLMENT / PROGRESS
// ============================================================

/**
 * status is ONLY "ACTIVE" | "EXPIRED" | "REVOKED" — payment states
 * (PENDING/PAID/FAILED/REFUNDED) live on Order/Payment, not here.
 * There is no Enrollment.paymentStatus or Enrollment.paymentRef.
 */
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  pricingId: string;
  orderItemId: string;
  orderId: string | null;
  status: EnrollmentStatus;
  startedAt: string;
  /** null = lifetime access. */
  expiresAt: string | null;
  completedAt: string | null;
  /** Denormalized read model — Progress rows remain authoritative. */
  progressPercentage: number;
}

export type EnrollmentListItem = Enrollment & {
  course: Pick<Course, "id" | "title" | "slug" | "thumbnail">;
  pricing: Pick<CoursePricing, "id" | "name" | "accessDurationDays">;
  certificate?: Certificate | null; // only if backend includes it
};

export interface EnrollmentWithCourse extends Enrollment {
  course: CourseWithInstructor;
  pricing: CoursePricing;
}

export interface EnrollmentWithProgress extends EnrollmentWithCourse {
  certificate: Certificate | null;
  progressRecords: Progress[];
}

export type WatchedRange = [start: number, end: number];

export interface Progress {
  id: string;
  enrollmentId: string;
  topicId: string;
  completed: boolean;
  watchedSeconds: number | null;
  watchedRanges: WatchedRange[];
  lastWatchedAt: string | null;
  duration: number | null;
  updatedAt: string;
}

// ============================================================
// ORDERS / PAYMENTS / CERTIFICATES
// ============================================================

export interface Order {
  id: string;
  userId: string | null;
  email: string | null;
  name: string | null;
  phone: string | null;
  totalAmount: string;
  isFreeOrder: boolean;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  pricingId: string;
  /** Immutable snapshot — do not fall back to live CoursePricing.price. */
  unitPrice: string;
  quantity: number;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { pricing: CoursePricing })[];
}

/**
 * Belongs to Order, not Enrollment — one payment can cover multiple
 * OrderItems / enrollments.
 */
export interface Payment {
  id: string;
  userId: string | null;
  reference: string;
  gatewayEventId: string | null;
  orderId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  // rawPayload intentionally omitted — reconciliation-only, never ship to frontend.
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  issuedAt: string;
  url: string;
  verification: string;
  /** Historical snapshot — course title may have since changed. */
  courseTitleAtIssuance: string;
}

// ============================================================
// CART
// ============================================================

export interface Cart {
  id: string;
  userId: string;
  pricingId: string;
  /** Derivable via pricing.course — not an independent source of truth. */
  courseId: string | null;
  quantity: number;
  price: string;
  createdAt: string;
}

export interface CartWithPricing extends Cart {
  pricing: CoursePricing & { course: Pick<Course, "id" | "title" | "slug" | "thumbnail"> };
}