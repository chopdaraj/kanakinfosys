import React from "react";

export function SkeletonCard() {
  return (
    <div className="kanak-card p-6 flex flex-col justify-between h-36 animate-skeleton-pulse">
      <div className="flex items-start justify-between">
        <div className="h-4 bg-slate-200 rounded-lg w-24" />
        <div className="w-9 h-9 bg-slate-200 rounded-xl" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-7 bg-slate-200 rounded-lg w-36" />
        <div className="h-3 bg-slate-200 rounded-lg w-28" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="kanak-card p-6 space-y-4 animate-skeleton-pulse">
      <div className="space-y-2 pb-2">
        <div className="h-4 bg-slate-200 rounded-lg w-28" />
        <div className="h-6 bg-slate-200 rounded-lg w-40" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-4 border-b border-slate-100 pb-2">
          {Array(cols).fill(0).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded-md w-20" />
          ))}
        </div>
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-2 border-b border-slate-50 last:border-0">
            {Array(cols).fill(0).map((_, j) => (
              <div key={j} className="h-4 bg-slate-200 rounded-md w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="kanak-card p-6 h-96 flex flex-col justify-between animate-skeleton-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-lg w-28" />
        <div className="h-6 bg-slate-200 rounded-lg w-48" />
      </div>
      <div className="flex-1 bg-slate-100 rounded-2xl mt-6 flex items-end justify-between p-4 gap-2">
        {Array(10).fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-slate-200 rounded-t-lg w-full"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-skeleton-pulse">
      <div className="lg:col-span-2 kanak-card p-6 space-y-6">
        <div className="h-6 bg-slate-200 rounded-lg w-48 border-b pb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-slate-200 rounded-md w-16" />
              <div className="h-9 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="kanak-card p-6 h-80 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded-lg w-32" />
          <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto" />
          <div className="h-4 bg-slate-200 rounded-lg w-40 mx-auto" />
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-full" />
      </div>
    </div>
  );
}
