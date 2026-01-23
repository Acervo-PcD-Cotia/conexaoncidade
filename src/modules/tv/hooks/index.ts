// ============================================
// Módulo TV Web - Hooks React Query
// ============================================

export { useTvLiveStatus, useStartTvLive, useStopTvLive } from "./useTvLiveStatus";
export { useTvIngest, useRevealTvStreamKey, useRegenerateTvCredentials } from "./useTvIngest";
export { useTvSchedule, useTvScheduleItem, useCreateTvScheduleItem, useUpdateTvScheduleItem, useDeleteTvScheduleItem } from "./useTvSchedule";
export { useTvVods, useTvVod, useUpdateTvVod, useDeleteTvVod } from "./useTvVod";
export { useTvUploads, useStartTvUpload, useCancelTvUpload } from "./useTvUploads";
export { useTvStats } from "./useTvStats";
export { useTvPlayers, useGenerateTvPlayer, useDeleteTvPlayer } from "./useTvPlayers";
export { useTvSettings, useUpdateTvSettings } from "./useTvSettings";
