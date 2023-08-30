-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Canvas" (
    "id" UUID NOT NULL,
    "latestAggregation" JSONB[],
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Canvas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasEvent" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "canvasId" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "shapeId" TEXT,
    "shape" JSONB,
    "pointerId" TEXT,
    "pointer" JSONB,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanvasEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CanvasEvent" ADD CONSTRAINT "CanvasEvent_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
