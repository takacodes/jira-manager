-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "projectName" TEXT NOT NULL,
    "jiraUrl" TEXT NOT NULL,
    "jiraEmail" TEXT NOT NULL,
    "jiraApiKey" TEXT NOT NULL,
    "filterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
