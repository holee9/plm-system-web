/**
 * PLM tRPC Router
 * Exposes parts, revisions, and BOM procedures
 */
import { z } from "zod";
import { router as createTRPCRouter, publicProcedure } from "~/server/trpc";
import * as plmService from "./service";
import {
  PlmValidationError,
  PlmNotFoundError,
  BomCycleError,
} from "./types";
import * as manufacturerService from "./manufacturer-service";

// TODO: Replace with actual auth context once implemented
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

function getUserId(ctx: any): string {
  // For now, use a test user ID
  // TODO: Get from ctx.user once auth is implemented
  return TEST_USER_ID;
}

// ============================================================================
// Zod Schemas
// ============================================================================

const partStatusEnum = z.enum(["draft", "active", "obsolete"]);

const createPartInput = z.object({
  projectId: z.string().uuid(),
  partNumber: z.string().min(1).max(50),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  status: partStatusEnum.optional(),
});

const updatePartInput = z.object({
  partId: z.string().uuid(),
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  status: partStatusEnum.optional(),
  changeDescription: z.string().optional(),
});

const partSearchParams = z.object({
  projectId: z.string().uuid(),
  query: z.string().optional(),
  category: z.string().optional(),
  status: partStatusEnum.optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const addBomItemInput = z.object({
  parentPartId: z.string().uuid(),
  childPartId: z.string().uuid(),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Quantity must be a positive number",
  }),
  unit: z.string().default("EA"),
  position: z.number().optional(),
  notes: z.string().optional(),
});

const updateBomItemInput = z.object({
  bomItemId: z.string().uuid(),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Quantity must be a positive number",
  }).optional(),
  unit: z.string().optional(),
  position: z.number().optional(),
  notes: z.string().optional(),
});

const removeBomItemInput = z.object({
  bomItemId: z.string().uuid(),
});

// ============================================================================
// PLM Router
// ============================================================================

export const plmRouter = createTRPCRouter({
  // ========================================================================
  // Part Procedures
  // ========================================================================

  part: createTRPCRouter({
    // Create a new part
    create: publicProcedure
      .input(createPartInput)
      .mutation(async ({ ctx, input }) => {
        try {
          const part = await plmService.createPart(input, ctx.user.id);

          return {
            success: true,
            data: part,
          };
        } catch (error) {
          if (error instanceof PlmValidationError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to create part");
        }
      }),

    // Get part by ID
    getById: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const part = await plmService.getPartById(input.partId, ctx.user.id);

        if (!part) {
          throw new Error("Part not found");
        }

        return part;
      }),

    // List parts with filters
    list: publicProcedure
      .input(partSearchParams)
      .query(async ({ ctx, input }) => {
        return plmService.listParts(input);
      }),

    // Update part (creates new revision)
    update: publicProcedure
      .input(updatePartInput)
      .mutation(async ({ ctx, input }) => {
        try {
          const part = await plmService.updatePart(input, ctx.user.id);

          return {
            success: true,
            data: part,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to update part");
        }
      }),

    // Search parts
    search: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().min(1).max(50).default(10),
        })
      )
      .query(async ({ ctx, input }) => {
        return plmService.searchParts(ctx.user.id, input.query, input.limit);
      }),

    // Get where-used
    whereUsed: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          return await plmService.getWhereUsed(input.partId);
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get where-used");
        }
      }),
  }),

  // ========================================================================
  // Revision Procedures
  // ========================================================================

  revision: createTRPCRouter({
    // Get revision history for a part
    list: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          return await plmService.getRevisionHistory(input.partId);
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get revision history");
        }
      }),

    // Get specific revision by ID
    getById: publicProcedure
      .input(z.object({ revisionId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        // TODO: Implement getRevisionById
        throw new Error("Not implemented");
      }),
  }),

  // ========================================================================
  // BOM Procedures
  // ========================================================================

  bom: createTRPCRouter({
    // Add item to BOM
    addItem: publicProcedure
      .input(addBomItemInput)
      .mutation(async ({ ctx, input }) => {
        try {
          const bomItem = await plmService.addBomItem(input);

          return {
            success: true,
            data: bomItem,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError ||
            error instanceof BomCycleError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to add BOM item");
        }
      }),

    // Update BOM item
    updateItem: publicProcedure
      .input(updateBomItemInput)
      .mutation(async ({ ctx, input }) => {
        try {
          const bomItem = await plmService.updateBomItem(input);

          return {
            success: true,
            data: bomItem,
          };
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to update BOM item");
        }
      }),

    // Remove BOM item
    removeItem: publicProcedure
      .input(removeBomItemInput)
      .mutation(async ({ ctx, input }) => {
        try {
          await plmService.removeBomItem(input);

          return {
            success: true,
          };
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to remove BOM item");
        }
      }),

    // Get BOM tree
    getTree: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          return await plmService.getBomTree(input.partId);
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get BOM tree");
        }
      }),

    // Get flat BOM list
    getFlatList: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          const bomTree = await plmService.getBomTree(input.partId);
          return bomTree.flatList;
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get BOM list");
        }
      }),

    // Export BOM as CSV
    export: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        try {
          const bomTree = await plmService.getBomTree(input.partId);

          // Generate CSV
          const headers = ["Level", "Part Number", "Name", "Quantity", "Unit", "Path"];
          const rows = bomTree.flatList.map(item => [
            item.level.toString(),
            item.partNumber,
            item.name,
            item.quantity,
            item.unit,
            item.path,
          ]);

          const csv = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
          ].join("\n");

          return {
            filename: `${bomTree.rootPart.partNumber}_BOM.csv`,
            content: csv,
          };
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to export BOM");
        }
      }),
  }),

  // ========================================================================
  // Manufacturer Procedures
  // ========================================================================

  manufacturer: createTRPCRouter({
    // Create a new manufacturer
    create: publicProcedure
      .input(
        z.object({
          code: z.string().min(1).max(20),
          name: z.string().min(2).max(255),
          website: z.string().url().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const manufacturer = await manufacturerService.createManufacturer(input, ctx.user.id);

          return {
            success: true,
            data: manufacturer,
          };
        } catch (error) {
          if (error instanceof PlmValidationError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to create manufacturer");
        }
      }),

    // Get manufacturer by ID
    getById: publicProcedure
      .input(z.object({ manufacturerId: z.string().uuid() }))
      .query(async ({ input }) => {
        const manufacturer = await manufacturerService.getManufacturerById(input.manufacturerId);

        if (!manufacturer) {
          throw new Error("Manufacturer not found");
        }

        return manufacturer;
      }),

    // List manufacturers with filters
    list: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return manufacturerService.listManufacturers(input);
      }),

    // Update manufacturer
    update: publicProcedure
      .input(
        z.object({
          manufacturerId: z.string().uuid(),
          code: z.string().min(1).max(20).optional(),
          name: z.string().min(2).max(255).optional(),
          website: z.string().url().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const manufacturer = await manufacturerService.updateManufacturer(input);

          return {
            success: true,
            data: manufacturer,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to update manufacturer");
        }
      }),

    // Delete manufacturer
    delete: publicProcedure
      .input(z.object({ manufacturerId: z.string().uuid() }))
      .mutation(async ({ input }) => {
        try {
          await manufacturerService.deleteManufacturer(input.manufacturerId);

          return {
            success: true,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to delete manufacturer");
        }
      }),

    // Get parts for manufacturer
    parts: publicProcedure
      .input(z.object({ manufacturerId: z.string().uuid() }))
      .query(async ({ input }) => {
        try {
          return await manufacturerService.getPartsForManufacturer(input.manufacturerId);
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get manufacturer parts");
        }
      }),
  }),

  // ========================================================================
  // Supplier Procedures
  // ========================================================================

  supplier: createTRPCRouter({
    // Create a new supplier
    create: publicProcedure
      .input(
        z.object({
          code: z.string().min(1).max(20),
          name: z.string().min(2).max(255),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          address: z.string().optional(),
          website: z.string().url().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const supplier = await manufacturerService.createSupplier(input, ctx.user.id);

          return {
            success: true,
            data: supplier,
          };
        } catch (error) {
          if (error instanceof PlmValidationError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to create supplier");
        }
      }),

    // Get supplier by ID
    getById: publicProcedure
      .input(z.object({ supplierId: z.string().uuid() }))
      .query(async ({ input }) => {
        const supplier = await manufacturerService.getSupplierById(input.supplierId);

        if (!supplier) {
          throw new Error("Supplier not found");
        }

        return supplier;
      }),

    // List suppliers with filters
    list: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return manufacturerService.listSuppliers(input);
      }),

    // Update supplier
    update: publicProcedure
      .input(
        z.object({
          supplierId: z.string().uuid(),
          code: z.string().min(1).max(20).optional(),
          name: z.string().min(2).max(255).optional(),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          address: z.string().optional(),
          website: z.string().url().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const supplier = await manufacturerService.updateSupplier(input);

          return {
            success: true,
            data: supplier,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to update supplier");
        }
      }),

    // Delete supplier
    delete: publicProcedure
      .input(z.object({ supplierId: z.string().uuid() }))
      .mutation(async ({ input }) => {
        try {
          await manufacturerService.deleteSupplier(input.supplierId);

          return {
            success: true,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to delete supplier");
        }
      }),

    // Get parts for supplier
    parts: publicProcedure
      .input(z.object({ supplierId: z.string().uuid() }))
      .query(async ({ input }) => {
        try {
          return await manufacturerService.getPartsForSupplier(input.supplierId);
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get supplier parts");
        }
      }),
  }),

  // ========================================================================
  // Part-Entity Linking Procedures
  // ========================================================================

  part: createTRPCRouter({
    // Link manufacturer to part
    linkManufacturer: publicProcedure
      .input(
        z.object({
          partId: z.string().uuid(),
          manufacturerId: z.string().uuid(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await manufacturerService.linkManufacturerToPart(
            input.partId,
            input.manufacturerId
          );

          return {
            success: true,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to link manufacturer to part");
        }
      }),

    // Unlink manufacturer from part
    unlinkManufacturer: publicProcedure
      .input(
        z.object({
          partId: z.string().uuid(),
          manufacturerId: z.string().uuid(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await manufacturerService.unlinkManufacturerFromPart(
            input.partId,
            input.manufacturerId
          );

          return {
            success: true,
          };
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to unlink manufacturer from part");
        }
      }),

    // Get manufacturers for part
    manufacturers: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ input }) => {
        try {
          return await manufacturerService.getManufacturersForPart(input.partId);
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get part manufacturers");
        }
      }),

    // Link supplier to part
    linkSupplier: publicProcedure
      .input(
        z.object({
          partId: z.string().uuid(),
          supplierId: z.string().uuid(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await manufacturerService.linkSupplierToPart(
            input.partId,
            input.supplierId
          );

          return {
            success: true,
          };
        } catch (error) {
          if (
            error instanceof PlmValidationError ||
            error instanceof PlmNotFoundError
          ) {
            throw new Error(error.message);
          }
          throw new Error("Failed to link supplier to part");
        }
      }),

    // Unlink supplier from part
    unlinkSupplier: publicProcedure
      .input(
        z.object({
          partId: z.string().uuid(),
          supplierId: z.string().uuid(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await manufacturerService.unlinkSupplierFromPart(
            input.partId,
            input.supplierId
          );

          return {
            success: true,
          };
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to unlink supplier from part");
        }
      }),

    // Get suppliers for part
    suppliers: publicProcedure
      .input(z.object({ partId: z.string().uuid() }))
      .query(async ({ input }) => {
        try {
          return await manufacturerService.getSuppliersForPart(input.partId);
        } catch (error) {
          if (error instanceof PlmNotFoundError) {
            throw new Error(error.message);
          }
          throw new Error("Failed to get part suppliers");
        }
      }),
  }),
});
