-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "suburb" TEXT,
    "cuisine" TEXT,
    "openingHours" JSONB,
    "dietaryTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);
