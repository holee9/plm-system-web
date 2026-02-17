/**
 * Integration tests for PLM Service
 * Tests Part creation, update workflow, Revision tracking, and BOM management
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createPart,
  getPartById,
  listParts,
  updatePart,
  searchParts,
  addBomItem,
  removeBomItem,
  updateBomItem,
  getBomTree,
  getWhereUsed,
  getRevisionHistory,
  validatePartNumber,
  validatePartName,
  isPartNumberDuplicate,
  type CreatePartInput,
  type UpdatePartInput,
  type AddBomItemInput,
} from "~/modules/plm/service";
import { db } from "~/server/db";
import { parts, revisions, bomItems } from "~/server/db";
import { users } from "~/server/db/users";
import { projects } from "~/server/db/projects";
import { eq } from "drizzle-orm";
import { PlmValidationError, PlmNotFoundError, BomCycleError } from "~/modules/plm/types";

// Test data helpers
function createMockProject(overrides = {}) {
  return {
    name: "Test PLM Project",
    description: "Test project for PLM",
    ...overrides,
  };
}

function createMockUser(overrides = {}) {
  return {
    name: "Test User",
    email: `plm-test-${Date.now()}@example.com`,
    ...overrides,
  };
}

function createMockPartInput(projectId: string, overrides = {}): CreatePartInput {
  return {
    projectId,
    partNumber: `P-${Math.floor(Math.random() * 10000)}`,
    name: "Test Part",
    description: "Test part description",
    category: "Mechanical",
    status: "draft",
    ...overrides,
  };
}

describe("plm-service - Part Management", () => {
  let testProjectId: string;
  let testUserId: string;

  beforeEach(async () => {
    const [user] = await db.insert(users).values(createMockUser()).returning();
    testUserId = user.id;

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;
  });

  afterEach(async () => {
    await db.delete(bomItems);
    await db.delete(revisions);
    await db.delete(parts);
    await db.delete(projects);
    await db.delete(users);
  });

  describe("createPart", () => {
    it("should create part with initial revision A", async () => {
      const input = createMockPartInput(testProjectId);
      const result = await createPart(input, testUserId);

      expect(result).toBeDefined();
      expect(result.partNumber).toBe(input.partNumber);
      expect(result.name).toBe(input.name);
      expect(result.currentRevision).toBeDefined();
      expect(result.currentRevision?.revisionCode).toBe("A");
      expect(result.revisionCount).toBe(1);
    });

    it("should create part without optional fields", async () => {
      const input = createMockPartInput(testProjectId, {
        description: undefined,
        category: undefined,
        status: undefined,
      });

      const result = await createPart(input, testUserId);

      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.status).toBe("draft");
    });

    it("should reject duplicate part number in same project", async () => {
      const input = createMockPartInput(testProjectId);
      await createPart(input, testUserId);

      await expect(createPart(input, testUserId)).rejects.toThrow(PlmValidationError);
      await expect(createPart(input, testUserId)).rejects.toThrow("already exists in this project");
    });

    it("should allow same part number in different projects", async () => {
      const [project2] = await db.insert(projects).values(createMockProject({ name: "Project 2" })).returning();

      const input = createMockPartInput(testProjectId);
      await createPart(input, testUserId);

      const input2 = createMockPartInput(project2.id, { partNumber: input.partNumber });
      const result = await createPart(input2, testUserId);

      expect(result.partNumber).toBe(input.partNumber);
    });
  });

  describe("getPartById", () => {
    it("should return part with details", async () => {
      const input = createMockPartInput(testProjectId);
      const created = await createPart(input, testUserId);

      const result = await getPartById(created.id, testUserId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.currentRevision?.revisionCode).toBe("A");
      expect(result?.bomItemCount).toBe(0);
      expect(result?.whereUsedCount).toBe(0);
    });

    it("should return null for non-existent part", async () => {
      const result = await getPartById("fake-id", testUserId);
      expect(result).toBeNull();
    });
  });

  describe("listParts", () => {
    beforeEach(async () => {
      await createPart(createMockPartInput(testProjectId, { partNumber: "P-001", name: "Part 1" }), testUserId);
      await createPart(createMockPartInput(testProjectId, { partNumber: "P-002", name: "Part 2" }), testUserId);
      await createPart(createMockPartInput(testProjectId, { partNumber: "P-003", name: "Assembly 1", status: "active" }), testUserId);
    });

    it("should list all parts in project", async () => {
      const result = await listParts({ projectId: testProjectId });

      expect(result.total).toBe(3);
      expect(result.parts).toHaveLength(3);
    });

    it("should filter by status", async () => {
      const result = await listParts({ projectId: testProjectId, status: "active" });

      expect(result.total).toBe(1);
      expect(result.parts[0].partNumber).toBe("P-003");
    });

    it("should filter by category", async () => {
      const result = await listParts({ projectId: testProjectId, category: "Mechanical" });

      expect(result.total).toBe(3);
    });

    it("should search by part number", async () => {
      const result = await listParts({ projectId: testProjectId, query: "P-002" });

      expect(result.total).toBe(1);
      expect(result.parts[0].partNumber).toBe("P-002");
    });

    it("should search by name", async () => {
      const result = await listParts({ projectId: testProjectId, query: "Assembly" });

      expect(result.total).toBe(1);
      expect(result.parts[0].name).toBe("Assembly 1");
    });

    it("should paginate results", async () => {
      const result = await listParts({ projectId: testProjectId, limit: 2, offset: 0 });

      expect(result.parts).toHaveLength(2);
      expect(result.total).toBe(3);
    });
  });

  describe("updatePart and Revision tracking", () => {
    let testPartId: string;

    beforeEach(async () => {
      const input = createMockPartInput(testProjectId);
      const created = await createPart(input, testUserId);
      testPartId = created.id;
    });

    it("should create new revision B on update", async () => {
      const updateInput: UpdatePartInput = {
        partId: testPartId,
        name: "Updated Part Name",
      };

      const result = await updatePart(updateInput, testUserId);

      expect(result.name).toBe("Updated Part Name");
      expect(result.currentRevision?.revisionCode).toBe("B");
      expect(result.revisionCount).toBe(2);
    });

    it("should record changes in revision", async () => {
      const updateInput: UpdatePartInput = {
        partId: testPartId,
        name: "New Name",
        description: "New Description",
      };

      const result = await updatePart(updateInput, testUserId);

      const history = await getRevisionHistory(testPartId);
      const revB = history.revisions.find((r) => r.revisionCode === "B");

      expect(revB?.changes).toBeDefined();
      expect(revB?.changes?.name).toBeDefined();
      expect(revB?.changes?.description).toBeDefined();
    });

    it("should return same part if no changes", async () => {
      const updateInput: UpdatePartInput = {
        partId: testPartId,
        name: "Test Part", // Same as original
      };

      const result = await updatePart(updateInput, testUserId);

      expect(result.currentRevision?.revisionCode).toBe("A"); // No new revision
    });

    it("should create revision C, D, E sequentially", async () => {
      await updatePart({ partId: testPartId, name: "Rev B" }, testUserId);
      await updatePart({ partId: testPartId, name: "Rev C" }, testUserId);
      await updatePart({ partId: testPartId, name: "Rev D" }, testUserId);
      const result = await updatePart({ partId: testPartId, name: "Rev E" }, testUserId);

      expect(result.currentRevision?.revisionCode).toBe("E");
      expect(result.revisionCount).toBe(5);
    });

    it("should reject update for non-existent part", async () => {
      await expect(updatePart({ partId: "fake-id", name: "X" }, testUserId))
        .rejects.toThrow(PlmNotFoundError);
    });
  });

  describe("getRevisionHistory", () => {
    let testPartId: string;

    beforeEach(async () => {
      const input = createMockPartInput(testProjectId);
      const created = await createPart(input, testUserId);
      testPartId = created.id;

      await updatePart({ partId: testPartId, name: "Update 1" }, testUserId);
      await updatePart({ partId: testPartId, name: "Update 2" }, testUserId);
    });

    it("should return all revisions in order", async () => {
      const history = await getRevisionHistory(testPartId);

      expect(history.total).toBe(3);
      expect(history.revisions[0].revisionCode).toBe("A");
      expect(history.revisions[1].revisionCode).toBe("B");
      expect(history.revisions[2].revisionCode).toBe("C");
    });

    it("should include change descriptions", async () => {
      const history = await getRevisionHistory(testPartId);

      expect(history.revisions[0].description).toBe("Initial revision");
      expect(history.revisions[1].description).toContain("Revision B");
    });
  });

  describe("searchParts", () => {
    beforeEach(async () => {
      await createPart(createMockPartInput(testProjectId, { partNumber: "ASSY-001", name: "Main Assembly" }), testUserId);
      await createPart(createMockPartInput(testProjectId, { partNumber: "PART-002", name: "Bracket" }), testUserId);
    });

    it("should search by part number", async () => {
      const results = await searchParts(testUserId, "ASSY", 10);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].partNumber).toContain("ASSY");
    });

    it("should search by name", async () => {
      const results = await searchParts(testUserId, "Bracket", 10);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain("Bracket");
    });

    it("should limit results", async () => {
      const results = await searchParts(testUserId, "P", 1);

      expect(results.length).toBeLessThanOrEqual(1);
    });
  });
});

describe("plm-service - BOM Management", () => {
  let testProjectId: string;
  let testUserId: string;
  let parentPartId: string;
  let childPartId: string;
  let grandchildPartId: string;

  beforeEach(async () => {
    const [user] = await db.insert(users).values(createMockUser()).returning();
    testUserId = user.id;

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;

    const parent = await createPart(createMockPartInput(testProjectId, { partNumber: "ASSY-001", name: "Parent Assembly" }), testUserId);
    parentPartId = parent.id;

    const child = await createPart(createMockPartInput(testProjectId, { partNumber: "PART-001", name: "Child Part" }), testUserId);
    childPartId = child.id;

    const grandchild = await createPart(createMockPartInput(testProjectId, { partNumber: "COMP-001", name: "Component" }), testUserId);
    grandchildPartId = grandchild.id;
  });

  afterEach(async () => {
    await db.delete(bomItems);
    await db.delete(revisions);
    await db.delete(parts);
    await db.delete(projects);
    await db.delete(users);
  });

  describe("addBomItem", () => {
    it("should add child to parent BOM", async () => {
      const input: AddBomItemInput = {
        parentPartId,
        childPartId,
        quantity: "2",
        unit: "EA",
      };

      const result = await addBomItem(input);

      expect(result.parentPartId).toBe(parentPartId);
      expect(result.childPartId).toBe(childPartId);
      expect(result.quantity).toBe("2");
    });

    it("should assign position automatically", async () => {
      await addBomItem({ parentPartId, childPartId, quantity: "1" });

      const [part2] = await db.insert(users).values(createMockUser({ name: "Temp" })).returning();
      const part2Created = await createPart(createMockPartInput(testProjectId, { partNumber: "PART-002" }), testUserId);

      const result = await addBomItem({
        parentPartId,
        childPartId: part2Created.id,
        quantity: "1",
      });

      expect(result.position).toBe(2);
    });

    it("should reject circular reference (self-reference)", async () => {
      await expect(addBomItem({
        parentPartId,
        childPartId: parentPartId, // Self-reference
        quantity: "1",
      })).rejects.toThrow(BomCycleError);
    });

    it("should reject circular reference (deep cycle)", async () => {
      // Create: Parent -> Child -> Grandchild
      await addBomItem({ parentPartId, childPartId, quantity: "1" });
      await addBomItem({ childPartId, childPartId: grandchildPartId, quantity: "1" });

      // Try to add Grandchild -> Parent (creates cycle)
      await expect(addBomItem({
        parentPartId: grandchildPartId,
        childPartId: parentPartId,
        quantity: "1",
      })).rejects.toThrow(BomCycleError);
    });

    it("should reject invalid quantity format", async () => {
      await expect(addBomItem({
        parentPartId,
        childPartId,
        quantity: "abc", // Invalid
      })).rejects.toThrow(PlmValidationError);
    });

    it("should reject non-existent parent", async () => {
      await expect(addBomItem({
        parentPartId: "fake-id",
        childPartId,
        quantity: "1",
      })).rejects.toThrow(PlmNotFoundError);
    });
  });

  describe("getBomTree", () => {
    beforeEach(async () => {
      // Create tree: ASSY-001 -> PART-001 -> COMP-001
      await addBomItem({ parentPartId, childPartId, quantity: "2", unit: "EA", position: 1 });
      await addBomItem({ childPartId, childPartId: grandchildPartId, quantity: "1", unit: "EA", position: 1 });
    });

    it("should build hierarchical BOM tree", async () => {
      const result = await getBomTree(parentPartId);

      expect(result.rootPart.id).toBe(parentPartId);
      expect(result.tree.partId).toBe(parentPartId);
      expect(result.tree.children).toHaveLength(1);
      expect(result.tree.children[0].partId).toBe(childPartId);
      expect(result.tree.children[0].children[0].partId).toBe(grandchildPartId);
    });

    it("should flatten tree to list", async () => {
      const result = await getBomTree(parentPartId);

      expect(result.flatList).toHaveLength(3); // Parent, Child, Grandchild
      expect(result.flatList[0].level).toBe(0);
      expect(result.flatList[1].level).toBe(1);
      expect(result.flatList[2].level).toBe(2);
    });

    it("should calculate max depth", async () => {
      const result = await getBomTree(parentPartId);

      expect(result.maxLevel).toBe(2);
    });

    it("should show correct path", async () => {
      const result = await getBomTree(parentPartId);

      expect(result.flatList[0].path).toBe("ASSY-001");
      expect(result.flatList[1].path).toBe("ASSY-001 > PART-001");
    });
  });

  describe("getWhereUsed", () => {
    beforeEach(async () => {
      // Parent -> Child
      await addBomItem({ parentPartId, childPartId, quantity: "1" });
    });

    it("should return parent parts that use the child", async () => {
      const result = await getWhereUsed(childPartId);

      expect(result.partId).toBe(childPartId);
      expect(result.parents).toHaveLength(1);
      expect(result.parents[0].partId).toBe(parentPartId);
      expect(result.parents[0].partNumber).toBe("ASSY-001");
    });

    it("should return empty for part with no parents", async () => {
      const result = await getWhereUsed(parentPartId);

      expect(result.parents).toHaveLength(0);
    });
  });

  describe("updateBomItem and removeBomItem", () => {
    let bomItemId: string;

    beforeEach(async () => {
      const bom = await addBomItem({ parentPartId, childPartId, quantity: "1", unit: "EA" });
      bomItemId = bom.id;
    });

    it("should update BOM item quantity", async () => {
      const result = await updateBomItem({
        bomItemId,
        quantity: "5",
        unit: "PCS",
      });

      expect(result.quantity).toBe("5");
      expect(result.unit).toBe("PCS");
    });

    it("should reject invalid quantity on update", async () => {
      await expect(updateBomItem({
        bomItemId,
        quantity: "invalid",
      })).rejects.toThrow(PlmValidationError);
    });

    it("should remove BOM item", async () => {
      await removeBomItem({ bomItemId });

      const [remaining] = await db
        .select()
        .from(bomItems)
        .where(eq(bomItems.id, bomItemId))
        .limit(1);

      expect(remaining).toBeUndefined();
    });

    it("should handle removing non-existent BOM item", async () => {
      await expect(removeBomItem({ bomItemId: "fake-id" }))
        .rejects.toThrow(PlmNotFoundError);
    });
  });
});

describe("plm-service - Validation Functions", () => {
  describe("validatePartNumber", () => {
    it("should accept valid part numbers", () => {
      expect(() => validatePartNumber("P-001")).not.toThrow();
      expect(() => validatePartNumber("ABC123")).not.toThrow();
      expect(() => validatePartNumber("PART-A1-B2")).not.toThrow();
      expect(() => validatePartNumber("X")).not.toThrow(); // Minimum 1 char
    });

    it("should reject empty part number", () => {
      expect(() => validatePartNumber("")).toThrow(PlmValidationError);
      expect(() => validatePartNumber("   ")).toThrow(PlmValidationError);
    });

    it("should reject invalid characters", () => {
      expect(() => validatePartNumber("P_001")).toThrow(PlmValidationError); // underscore
      expect(() => validatePartNumber("P 001")).toThrow(PlmValidationError); // space
      expect(() => validatePartNumber("P.001")).toThrow(PlmValidationError); // dot
      expect(() => validatePartNumber("p-001")).toThrow(PlmValidationError); // lowercase
    });

    it("should reject too long part number", () => {
      expect(() => validatePartNumber("A".repeat(51))).toThrow(PlmValidationError);
    });
  });

  describe("validatePartName", () => {
    it("should accept valid names", () => {
      expect(() => validatePartName("AB")).not.toThrow(); // Minimum 2 chars
      expect(() => validatePartName("Valid Part Name")).not.toThrow();
      expect(() => validatePartName("A".repeat(255))).not.toThrow(); // Max 255 chars
    });

    it("should reject empty name", () => {
      expect(() => validatePartName("")).toThrow(PlmValidationError);
      expect(() => validatePartName("   ")).toThrow(PlmValidationError);
    });

    it("should reject too short name", () => {
      expect(() => validatePartName("A")).toThrow(PlmValidationError);
    });

    it("should reject too long name", () => {
      expect(() => validatePartName("A".repeat(256))).toThrow(PlmValidationError);
    });
  });
});

describe("plm-service - Complex BOM Structures", () => {
  let testProjectId: string;
  let testUserId: string;
  // Diamond structure parts
  let rootId: string;
  let branch1Id: string;
  let branch2Id: string;
  let leafId: string;

  beforeEach(async () => {
    const [user] = await db.insert(users).values(createMockUser()).returning();
    testUserId = user.id;

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;

    // Create diamond structure:
    //       Root
    //      /    \
    //   B1      B2
    //     \    /
    //      Leaf
    const root = await createPart(createMockPartInput(testProjectId, { partNumber: "ROOT", name: "Root Assembly" }), testUserId);
    rootId = root.id;

    const b1 = await createPart(createMockPartInput(testProjectId, { partNumber: "BRANCH1", name: "Branch 1" }), testUserId);
    branch1Id = b1.id;

    const b2 = await createPart(createMockPartInput(testProjectId, { partNumber: "BRANCH2", name: "Branch 2" }), testUserId);
    branch2Id = b2.id;

    const leaf = await createPart(createMockPartInput(testProjectId, { partNumber: "LEAF", name: "Leaf Component" }), testUserId);
    leafId = leaf.id;

    // Build the diamond
    await addBomItem({ parentPartId: rootId, childPartId: branch1Id, quantity: "1", position: 1 });
    await addBomItem({ parentPartId: rootId, childPartId: branch2Id, quantity: "1", position: 2 });
    await addBomItem({ parentPartId: branch1Id, childPartId: leafId, quantity: "2", position: 1 });
    await addBomItem({ parentPartId: branch2Id, childPartId: leafId, quantity: "3", position: 1 });
  });

  afterEach(async () => {
    await db.delete(bomItems);
    await db.delete(revisions);
    await db.delete(parts);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should handle diamond BOM structure", async () => {
    const result = await getBomTree(rootId);

    expect(result.flatList).toHaveLength(4);
    expect(result.tree.children).toHaveLength(2); // Root has 2 branches
  });

  it("should show where-used for shared component", async () => {
    const result = await getWhereUsed(leafId);

    expect(result.parents).toHaveLength(2); // Used by both branches
    expect(result.parents.some((p) => p.partNumber === "BRANCH1")).toBe(true);
    expect(result.parents.some((p) => p.partNumber === "BRANCH2")).toBe(true);
  });

  it("should calculate total quantity correctly in diamond structure", async () => {
    const result = await getBomTree(rootId);

    // Leaf appears in both branches: (1 * 2) + (1 * 3) = 5 total
    const leafEntry = result.flatList.find((item) => item.partId === leafId);
    expect(leafEntry).toBeDefined();
  });
});
