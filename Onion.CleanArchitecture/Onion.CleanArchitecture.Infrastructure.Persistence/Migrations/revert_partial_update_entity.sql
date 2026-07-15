-- Revert partially-applied UpdateEntity migration

-- 1. Drop the newly added ProposalConfigId
ALTER TABLE "PurchaseRequests" DROP COLUMN "ProposalConfigId";

-- 2. Revert DepartmentId back to uuid
ALTER TABLE "PurchaseRequests" ALTER COLUMN "DepartmentId" TYPE uuid USING "DepartmentId"::text::uuid;

-- 3. Re-add PurchaseConfigId column
ALTER TABLE "PurchaseRequests" ADD COLUMN "PurchaseConfigId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- 4. Re-add shadow FK columns
ALTER TABLE "PurchaseRequestLogs" ADD COLUMN "PurchaseRequestId1" integer NULL;
ALTER TABLE "PurchaseRequestItems" ADD COLUMN "ProductId1" integer NULL;
ALTER TABLE "PurchaseRequestItems" ADD COLUMN "RequestCategoryId" integer NULL;
ALTER TABLE "PurchaseRequestCategories" ADD COLUMN "PurchaseRequestId1" integer NULL;

-- 5. Re-add indexes
CREATE INDEX "IX_PurchaseRequestLogs_PurchaseRequestId1" ON "PurchaseRequestLogs" ("PurchaseRequestId1");
CREATE INDEX "IX_PurchaseRequestItems_ProductId1" ON "PurchaseRequestItems" ("ProductId1");
CREATE INDEX "IX_PurchaseRequestItems_RequestCategoryId" ON "PurchaseRequestItems" ("RequestCategoryId");
CREATE INDEX "IX_PurchaseRequestCategories_PurchaseRequestId1" ON "PurchaseRequestCategories" ("PurchaseRequestId1");

-- 6. Re-add foreign keys
ALTER TABLE "PurchaseRequestCategories" ADD CONSTRAINT "FK_PurchaseRequestCategories_PurchaseRequests_PurchaseRequestI~" FOREIGN KEY ("PurchaseRequestId1") REFERENCES "PurchaseRequests" ("Id");
ALTER TABLE "PurchaseRequestItems" ADD CONSTRAINT "FK_PurchaseRequestItems_Products_ProductId1" FOREIGN KEY ("ProductId1") REFERENCES "Products" ("Id");
ALTER TABLE "PurchaseRequestItems" ADD CONSTRAINT "FK_PurchaseRequestItems_PurchaseRequestCategories_RequestCateg~" FOREIGN KEY ("RequestCategoryId") REFERENCES "PurchaseRequestCategories" ("Id");
ALTER TABLE "PurchaseRequestLogs" ADD CONSTRAINT "FK_PurchaseRequestLogs_PurchaseRequests_PurchaseRequestId1" FOREIGN KEY ("PurchaseRequestId1") REFERENCES "PurchaseRequests" ("Id");

-- Budgets table already dropped, not recreating it
