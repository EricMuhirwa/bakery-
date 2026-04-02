# TODO: Fix DailySale Prisma Error

## Steps:
- [x] Step 1: Edit `bakery-/Back_end/src/v1/DTOs/dailySaleDTO.ts` to add frontend fields to interface and update DTO methods to filter valid Prisma fields
- [x] Step 2: Edit `bakery-/Back_end/src/v1/services/dailySaleService.ts` to sanitize input with DTO before Prisma calls
- [ ] Step 3: Run `cd bakery-/Back_end && npx prisma generate` to regenerate Prisma client
- [ ] Step 4: Restart backend server if needed
- [ ] Step 5: Test daily sale creation from frontend
- [ ] Step 6: attempt_completion

