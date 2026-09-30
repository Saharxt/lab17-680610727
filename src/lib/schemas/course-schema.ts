import { z } from "zod";

import type { Course } from "@/lib/types";

export const MAX_INSTRUCTORS = 3;
export const MAX_COURSE_TITLE = 100;
export const MAX_DESCRIPTION = 100;
export const INSTRUCTOR_EMAIL_DOMAIN = "@cmu.ac.th";

export const programOptions = [
  { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
  { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
];

export const semesterOptions = [
  { value: "1", label: "ภาคการศึกษาที่ 1" },
  { value: "2", label: "ภาคการศึกษาที่ 2" },
  { value: "3", label: "ภาคฤดูร้อน" },
];

const instructorSchema = z.object({
  name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
  email: z
    .string()
    .trim()
    .pipe(z.email({ message: "อีเมลไม่ถูกต้อง", abort: true }))
    .refine(
      (value) => value.toLowerCase().endsWith(INSTRUCTOR_EMAIL_DOMAIN),
      `ต้องเป็นอีเมล ${INSTRUCTOR_EMAIL_DOMAIN}`,
    ),
});

export function createCourseFormSchema(existingCourses: Course[]) {
  return z.object({
    courseId: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก")
      .refine(
        (id) => !existingCourses.some((c) => c.courseId === id),
        "รหัสวิชานี้มีอยู่แล้ว",
      ),
    courseTitle: z
      .string()
      .trim()
      .min(1, "กรอกชื่อวิชา")
      .max(
        MAX_COURSE_TITLE,
        `ชื่อวิชายาวได้ไม่เกิน ${MAX_COURSE_TITLE} ตัวอักษร`,
      ),
    program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
    semester: z.enum(["1", "2", "3"], { message: "เลือกภาคการศึกษา" }),
    description: z
      .string()
      .max(
        MAX_DESCRIPTION,
        `รายละเอียดยาวได้ไม่เกิน ${MAX_DESCRIPTION} ตัวอักษร`,
      )
      .trim(),
    instructors: z
      .array(instructorSchema)
      .min(1, "ต้องมีผู้สอนอย่างน้อย 1 คน")
      .max(MAX_INSTRUCTORS, `มีผู้สอนได้ไม่เกิน ${MAX_INSTRUCTORS} คน`)
      .refine(
        (items) =>
          new Set(items.map((i) => i.email.toLowerCase())).size ===
          items.length,
        "อีเมลผู้สอนซ้ำกัน",
      ),
    notifyByEmail: z.boolean(),
  });
}

export type CourseFormValues = z.infer<
  ReturnType<typeof createCourseFormSchema>
>;
