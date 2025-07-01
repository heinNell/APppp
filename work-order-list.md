# 🧾 Default Work Order List

This markdown provides a template and sample records for work orders (job cards) in your Workshop system.

---

## Work Order List

### WO-1001
- **Linked Inspection ID:** 21H
- **Fleet Number:** 21H
- **Open Date:** 2024-01-15
- **Technician Assigned:** John Smith
- **Tasks:**
  - Inspect oil leak (Completed)
  - Replace oil gasket (In Progress)
- **Required Parts:**
  - Oil gasket (1, in stock)
  - Engine oil (5L, in stock)
- **Labor Hours:** 1.5
- **Status:** In Progress
- **Notes:** Awaiting part delivery for gasket replacement.

---

### WO-1002
- **Linked Inspection ID:** 22H
- **Fleet Number:** 22H
- **Open Date:** 2024-01-16
- **Technician Assigned:** Sarah Johnson
- **Tasks:**
  - Replace brake pads (Pending)
  - Test brake system (Pending)
- **Required Parts:**
  - Brake pads (2 sets, out of stock)
- **Labor Hours:** 2.0
- **Status:** Parts Pending
- **Notes:** Brake pads on order, job card cannot proceed until parts arrive.

---

## Work Order Attributes
- **Work Order ID**: Unique identifier (e.g., WO-1001)
- **Linked Inspection ID**: Reference to the inspection that triggered the work order
- **Fleet Number**: Vehicle identifier
- **Open Date**: Date work order was created
- **Technician Assigned**: Name of technician
- **Tasks**: List of tasks with status
- **Required Parts**: List of parts, quantity, and stock status
- **Labor Hours**: Estimated or actual hours
- **Status**: Created, Assigned, In Progress, Parts Pending, Completed, Invoiced
- **Notes**: Additional remarks

---

> # Maintenance Work Order

---

## Work Order Info

- **Work Order #:** WO1147
- **Date:** 30-Jun-2025 14:33
- **Work Order Title:** 1T Lights Repairs / Greasing

---

## Vehicle / Asset Details

- **Vehicle #:** 1T ADZ9011/ADZ9010
- **Vehicle Name:** 1T ADZ9011/ADZ9010
- **Model:** FLAT DECK TRAILER
- **Meter Reading:** 70998 KM
- **Status:** Initiated
- **Priority:** Low
- **Type:** General
- **Assigned To:** Workshop
- **Created By:** Cain Jeche

---

## Linked Records

- **Linked Inspection:** (Inspection Ref/ID)
- **Linked Workorder:** (Parent WO Ref/ID)

---

## Scheduling

- **Start Date:** 30-Jun-2025 14:31
- **Due Date:** 30-Jun-2025 16:31
- **Completion Date:** 
- **Estimated Cost:** 
- **Estimated Time (Hours):** 
- **Actual Time (Hours):** 1H 0M

---

## Task Details

| SN | Task                | Status    | Type     | Assigned  | Note  |
|----|---------------------|-----------|----------|-----------|-------|
| 1  | 2 x Red Led Lights  | Initiated | Replace  |           |       |
| 2  | 2 x Bearing Grease  | Initiated | Replace  |           |       |

---

## Parts & Material Details

| SN | Item Number | Item Name           | Quantity | Total Cost | Note          |
|----|-------------|---------------------|----------|------------|---------------|
| 1  | RED         | Red LED Truck Lights| 2 Piece  | 17.96      |               |
| 2  | TTAP0002    | Insulation Tape     | 1 Piece  | 1          |               |
| 3  | (none)      | Bearing Grease (/Kg)| 2 Piece  | 23.2       |               |
| 4  | (none)      | Silicone Sealant    | 1 Piece  | 3          |               |

---

## Labor Details

| SN | Labor Name | Labor Code | Rate | Hours  | Cost | Note |
|----|------------|------------|------|--------|------|------|
| 1  | Workshop   | 0          |      | 1H 0M  | 0    |      |

---

## Additional Costs

| SN | Cost Description | Cost |
|----|------------------|------|
|    |                  |      |

---

## Summary

- **Parts & Material Cost:** 45.16
- **Total Labor Cost:** 0
- **Additional Cost:** 0
- **Tax Amount (0%):** 0
- **Total WO Cost:** 45.16

---

## Custom Business Fields

- **Last replace?:** 11/06/2025

---

## Workorder Memo

> 2 x Red Led Lights, 1 x Insulation Tape, 2 x Bearing Grease, 1 x Silicone Sealant

---
AdJob Card / Maintenance Report
Report.pdf – Maintenance Work Order / Job Card (30-Jun-2025)

d new work orders below using the same format. This list can be used to seed your Firestore database or as a template for your Work Order UI.
