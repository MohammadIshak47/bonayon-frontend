/**
 * COMPILE-TIME CONTRACT CHECK. openapi.d.ts is generated from the backend's live OpenAPI schema
 * (`npm run gen:api`). Each line below fails the typecheck if the backend's RESPONSE cannot be
 * consumed as the hand-written frontend type, or if the frontend's REQUEST is not accepted by the backend.
 */
import type { components } from './openapi';
import type * as F from './api';
import type { NewFarm, NewPlot } from '@/features/farms/hooks';

type S = components['schemas'];
type Ok<A, B> = [A] extends [B] ? true : false;
type Expect<T extends true> = T;

// responses: backend -> frontend
export type Checks = [
  Expect<Ok<S['UserOut'], F.User>>,
  Expect<Ok<S['DistrictOut'], F.District>>,
  Expect<Ok<S['CropOut'], F.Crop>>,
  Expect<Ok<S['FarmOut'], F.Farm>>,
  Expect<Ok<S['PlotOut'], F.Plot>>,
  Expect<Ok<S['RecommendationOut'], F.Recommendation>>,
  Expect<Ok<S['ProfileOut'], F.ClimateProfile>>,
  Expect<Ok<S['RiskCalendarOut'], F.RiskCalendar>>,
  Expect<Ok<S['AnomaliesOut'], F.Anomalies>>,
  Expect<Ok<S['TokenOut'], F.TokenResponse>>,
  Expect<Ok<S['RotationSuggestOut'], F.RotationSuggestResponse>>,
  Expect<Ok<S['RotationPlanOut'], F.RotationPlan>>,
  Expect<Ok<S['EstimateOut'], F.InputEstimate>>,
  Expect<Ok<S['DashboardOut'], F.Dashboard>>,
  Expect<Ok<S['AuditLogOut'], F.AuditLog>>,
  Expect<Ok<S['Page_UserOut_'], F.Paginated<F.User>>>,
  Expect<Ok<S['Page_FarmOut_'], F.Paginated<F.Farm>>>,
  Expect<Ok<S['Page_RecommendationOut_'], F.Paginated<F.Recommendation>>>,
  // requests: frontend -> backend
  Expect<Ok<NewFarm, S['FarmIn']>>,
  Expect<Ok<NewPlot, S['PlotIn']>>,
  Expect<Ok<F.CropChoiceRequest, S['CropChoiceIn']>>,
];
