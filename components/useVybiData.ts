"use client";

import { useEffect, useState } from "react";
import { api, type PredictionRow, type BiomeRow, type PreventionScores, type CycleRow } from "@/lib/client-api";

export interface DashboardData {
  loading: boolean;
  prediction: PredictionRow | null;
  biome: BiomeRow | null;
  prevention: PreventionScores | null;
}

// Loads the core signals for the authenticated user. For guests/anonymous
// users every call returns null, so screens transparently fall back to their
// default presentation.
export function useDashboard(reloadKey = 0): DashboardData {
  const [data, setData] = useState<DashboardData>({
    loading: true,
    prediction: null,
    biome: null,
    prevention: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, b, prev] = await Promise.all([
        api.latestPrediction(),
        api.latestBiome(),
        api.preventionScores(),
      ]);
      if (!alive) return;
      setData({
        loading: false,
        prediction: p?.prediction ?? null,
        biome: b?.biome ?? null,
        prevention: prev ?? null,
      });
    })();
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  return data;
}

// Loads the user's cycle logs (newest first). `reloadKey` lets callers refetch
// after logging a new period.
export function useCycles(reloadKey = 0): { loading: boolean; cycles: CycleRow[] } {
  const [state, setState] = useState<{ loading: boolean; cycles: CycleRow[] }>({
    loading: true,
    cycles: [],
  });
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await api.cycles();
      if (!alive) return;
      setState({ loading: false, cycles: res?.cycles ?? [] });
    })();
    return () => {
      alive = false;
    };
  }, [reloadKey]);
  return state;
}

export interface HealthMonth {
  month: string;
  entries: number;
  avg_sleep_hours: number | null;
  avg_hydration_litres: number | null;
  total_exercise_sessions: number;
  stress_levels: string[];
}

// Loads the monthly health summary (most recent month first).
export function useHealthSummary(): { loading: boolean; latest: HealthMonth | null } {
  const [state, setState] = useState<{ loading: boolean; latest: HealthMonth | null }>({
    loading: true,
    latest: null,
  });
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await api.healthSummary();
      if (!alive) return;
      const latest = (res?.summary?.[0] as HealthMonth | undefined) ?? null;
      setState({ loading: false, latest });
    })();
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
