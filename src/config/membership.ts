/** Membership plan slugs by audience — must match backend seed slugs */
export const INDIVIDUAL_PLAN_SLUGS = ['starter', 'business'] as const;
export const CORPORATE_PLAN_SLUGS = ['corporate', 'international'] as const;

export type IndividualPlanSlug = (typeof INDIVIDUAL_PLAN_SLUGS)[number];
export type CorporatePlanSlug = (typeof CORPORATE_PLAN_SLUGS)[number];
