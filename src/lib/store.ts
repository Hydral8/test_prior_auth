// In-memory store — resets on redeploy, perfect for a simulator

export interface AuthCode {
  code: string;
  memberId: string;
  email: string;
  expiresAt: number;
}

export interface Session {
  userId: string; // memberId or providerId
  email: string;
  displayName: string;
  role: "member" | "provider";
  providerNpi?: string;
}

export interface Provider {
  name: string;
  email: string;
  npi: string;
  specialty: string;
  organization: string;
}

export interface PriorAuth {
  id: string;
  memberId: string;
  patientName: string;
  dateOfBirth: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  procedureCode: string;
  procedureDescription: string;
  providerName: string;
  providerNpi: string;
  urgency: "routine" | "urgent";
  notes: string;
  attachments: string[];
  status: "submitted" | "under_review" | "approved" | "denied" | "pending_info";
  statusHistory: { status: string; timestamp: number; note: string }[];
  submittedAt: number;
  updatedAt: number;
}

// Simulated member database
export const MEMBERS: Record<string, { name: string; email: string; plan: string; group: string; effectiveDate: string; termDate: string; copay: string; deductible: string; deductibleMet: string; outOfPocketMax: string; outOfPocketMet: string }> = {
  "MBR001": {
    name: "John Smith",
    email: "",
    plan: "Gold PPO",
    group: "GRP-10042",
    effectiveDate: "2025-01-01",
    termDate: "2025-12-31",
    copay: "$30",
    deductible: "$1,500",
    deductibleMet: "$875",
    outOfPocketMax: "$6,000",
    outOfPocketMet: "$2,100",
  },
  "MBR002": {
    name: "Jane Doe",
    email: "",
    plan: "Silver HMO",
    group: "GRP-20085",
    effectiveDate: "2025-03-01",
    termDate: "2025-12-31",
    copay: "$40",
    deductible: "$2,500",
    deductibleMet: "$500",
    outOfPocketMax: "$8,000",
    outOfPocketMet: "$900",
  },
  "MBR003": {
    name: "Robert Johnson",
    email: "",
    plan: "Platinum PPO",
    group: "GRP-30012",
    effectiveDate: "2024-06-01",
    termDate: "2025-05-31",
    copay: "$20",
    deductible: "$500",
    deductibleMet: "$500",
    outOfPocketMax: "$3,000",
    outOfPocketMet: "$1,800",
  },
};

// Simulated provider database
export const PROVIDERS: Record<string, Provider> = {
  "PRV001": {
    name: "Dr. Sarah Chen",
    email: "",
    npi: "1234567890",
    specialty: "Radiology",
    organization: "Metro Imaging Center",
  },
  "PRV002": {
    name: "Dr. Michael Park",
    email: "",
    npi: "0987654321",
    specialty: "Neurology",
    organization: "Citywide Neurology Associates",
  },
  "PRV003": {
    name: "Dr. Emily Rodriguez",
    email: "",
    npi: "6677889900",
    specialty: "Cardiology",
    organization: "Heart & Vascular Institute",
  },
};

// In-memory stores
export const authCodes = new Map<string, AuthCode>();
export const sessions = new Map<string, Session>();
export const priorAuths = new Map<string, PriorAuth>();

// Seed some demo prior auths
const demoAuths: PriorAuth[] = [
  {
    id: "PA-2025-0001",
    memberId: "MBR001",
    patientName: "John Smith",
    dateOfBirth: "1985-03-15",
    diagnosisCode: "M54.5",
    diagnosisDescription: "Low back pain",
    procedureCode: "72148",
    procedureDescription: "MRI Lumbar Spine without Contrast",
    providerName: "Dr. Sarah Chen",
    providerNpi: "1234567890",
    urgency: "routine",
    notes: "Patient reports chronic lower back pain for 6 weeks",
    attachments: [],
    status: "approved",
    statusHistory: [
      { status: "submitted", timestamp: Date.now() - 86400000 * 5, note: "Prior authorization request received" },
      { status: "under_review", timestamp: Date.now() - 86400000 * 3, note: "Assigned to clinical reviewer" },
      { status: "approved", timestamp: Date.now() - 86400000 * 1, note: "Meets medical necessity criteria" },
    ],
    submittedAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: "PA-2025-0002",
    memberId: "MBR001",
    patientName: "John Smith",
    dateOfBirth: "1985-03-15",
    diagnosisCode: "G43.909",
    diagnosisDescription: "Migraine, unspecified",
    procedureCode: "70553",
    procedureDescription: "MRI Brain with and without Contrast",
    providerName: "Dr. Michael Park",
    providerNpi: "0987654321",
    urgency: "urgent",
    notes: "Severe migraines with visual disturbances, r/o structural abnormality",
    attachments: [],
    status: "under_review",
    statusHistory: [
      { status: "submitted", timestamp: Date.now() - 86400000 * 2, note: "Prior authorization request received" },
      { status: "under_review", timestamp: Date.now() - 86400000 * 1, note: "Expedited review — urgent request" },
    ],
    submittedAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: "PA-2025-0003",
    memberId: "MBR002",
    patientName: "Jane Doe",
    dateOfBirth: "1990-07-22",
    diagnosisCode: "E11.65",
    diagnosisDescription: "Type 2 diabetes with hyperglycemia",
    procedureCode: "95251",
    procedureDescription: "Continuous Glucose Monitoring (CGM) System",
    providerName: "Dr. Lisa Wang",
    providerNpi: "1122334455",
    urgency: "routine",
    notes: "Patient with uncontrolled A1C of 9.2%, requires CGM for better glucose management",
    attachments: ["lab_results_a1c.pdf", "clinical_notes_20250215.pdf"],
    status: "denied",
    statusHistory: [
      { status: "submitted", timestamp: Date.now() - 86400000 * 10, note: "Prior authorization request received" },
      { status: "under_review", timestamp: Date.now() - 86400000 * 7, note: "Assigned to clinical reviewer" },
      { status: "pending_info", timestamp: Date.now() - 86400000 * 5, note: "Requesting 3 months of blood glucose logs" },
      { status: "under_review", timestamp: Date.now() - 86400000 * 3, note: "Additional documentation received" },
      { status: "denied", timestamp: Date.now() - 86400000 * 1, note: "Does not meet step therapy requirement. Must trial formulary alternative first." },
    ],
    submittedAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: "PA-2025-0004",
    memberId: "MBR002",
    patientName: "Jane Doe",
    dateOfBirth: "1990-07-22",
    diagnosisCode: "M17.11",
    diagnosisDescription: "Primary osteoarthritis, right knee",
    procedureCode: "27447",
    procedureDescription: "Total Knee Replacement (Arthroplasty)",
    providerName: "Dr. James Miller",
    providerNpi: "5566778899",
    urgency: "routine",
    notes: "Failed conservative treatment x 6 months. BMI 28. Non-smoker.",
    attachments: ["xray_right_knee.jpg", "pt_notes_6mo.pdf", "ortho_eval.pdf"],
    status: "submitted",
    statusHistory: [
      { status: "submitted", timestamp: Date.now() - 86400000 * 1, note: "Prior authorization request received" },
    ],
    submittedAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: "PA-2025-0005",
    memberId: "MBR003",
    patientName: "Robert Johnson",
    dateOfBirth: "1972-11-08",
    diagnosisCode: "I25.10",
    diagnosisDescription: "Atherosclerotic heart disease",
    procedureCode: "93458",
    procedureDescription: "Left Heart Catheterization",
    providerName: "Dr. Emily Rodriguez",
    providerNpi: "6677889900",
    urgency: "urgent",
    notes: "Abnormal stress test with ST depression. Chest pain on exertion. Family hx of CAD.",
    attachments: ["stress_test_report.pdf", "ekg_results.pdf"],
    status: "approved",
    statusHistory: [
      { status: "submitted", timestamp: Date.now() - 86400000 * 4, note: "Prior authorization request received" },
      { status: "under_review", timestamp: Date.now() - 86400000 * 3, note: "Expedited review — urgent request" },
      { status: "approved", timestamp: Date.now() - 86400000 * 2, note: "Approved — meets urgent medical necessity criteria" },
    ],
    submittedAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "PA-2025-0006",
    memberId: "MBR003",
    patientName: "Robert Johnson",
    dateOfBirth: "1972-11-08",
    diagnosisCode: "G47.33",
    diagnosisDescription: "Obstructive sleep apnea",
    procedureCode: "E0601",
    procedureDescription: "CPAP Device",
    providerName: "Dr. Karen Thompson",
    providerNpi: "7788990011",
    urgency: "routine",
    notes: "Sleep study AHI 32. Daytime somnolence. Epworth score 16.",
    attachments: ["sleep_study_report.pdf"],
    status: "pending_info",
    statusHistory: [
      { status: "submitted", timestamp: Date.now() - 86400000 * 6, note: "Prior authorization request received" },
      { status: "under_review", timestamp: Date.now() - 86400000 * 4, note: "Assigned to clinical reviewer" },
      { status: "pending_info", timestamp: Date.now() - 86400000 * 2, note: "Requesting complete sleep study polysomnography report with AHI scoring" },
    ],
    submittedAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

demoAuths.forEach((a) => priorAuths.set(a.id, a));
