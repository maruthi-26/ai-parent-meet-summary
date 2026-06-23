CREATE TABLE IF NOT EXISTS "Notice" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "targetAudience" TEXT NOT NULL DEFAULT 'ALL',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Notice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ParentFeedback" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParentFeedback_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ParentFeedback_meetingId_key" UNIQUE ("meetingId"),
  CONSTRAINT "ParentFeedback_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

ALTER TABLE "Meeting" ADD COLUMN IF NOT EXISTS "satisfactionRating" INTEGER;
