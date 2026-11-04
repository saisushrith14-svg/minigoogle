import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
} from '@xyflow/react';
import type { WebPage } from '../../types';
import { cn } from '../../utils/cn';
import { formatScore } from '../../utils/format';
import { computeCircularLayout, computeForceLayout, type Point } from '../../utils/layout';

export type LayoutMode = 'force' | 'circular';

export interface GraphNodeData extends Record<string, unknown> {
  readonly page: WebPage;
  readonly rank: number;
  readonly score: number;
  readonly color: string;
  readonly isKey: boolean;
  readonly selected: boolean;
  readonly metricLabel: string;
}

type PageNodeType = Node<GraphNodeData, 'page'>;

const PAGE_NODE_TYPE = 'page';

function interpolateColor(value: number, from: readonly number[], to: readonly number[]): string {
  const ratio = Math.max(0, Math.min(1, value));
  const [r1, g1, b1] = from;
  const [r2, g2, b2] = to;
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

function metricColor(value: number, metric: 'keyword' | 'pagerank' | 'hybrid' | 'behaviour'): string {
  switch (metric) {
    case 'keyword':
      return interpolateColor(value, [203, 213, 225], [217, 119, 6]);
    case 'pagerank':
      return interpolateColor(value, [203, 213, 225], [124, 58, 237]);
    case 'behaviour':
      return interpolateColor(value, [203, 213, 225], [5, 150, 105]);
    case 'hybrid':
    default:
      return interpolateColor(value, [203, 213, 225], [37, 99, 235]);
  }
}

function PageNodeView({ data, selected }: NodeProps<PageNodeType>) {
  const isActive = selected || data.selected;
  return (
    <div
      className={cn(
        'w-[190px] rounded-xl border bg-white px-3 py-2.5 shadow-sm transition',
        isActive
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md',
      )}
      style={{ borderTopColor: data.color, borderTopWidth: 4 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-slate-300"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
          #{data.rank}
        </span>
        {data.isKey ? (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
            key
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-4 text-slate-900">
        {data.page.title}
      </p>
      <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{data.page.category}</p>
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5">
        <span className="text-[9px] uppercase tracking-wide text-slate-400">{data.metricLabel}</span>
        <span className="font-mono text-[10px] font-semibold text-slate-700">
          {formatScore(data.score)}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-slate-400"
      />
    </div>
  );
}

const nodeTypes = { [PAGE_NODE_TYPE]: PageNodeView };

export interface KnowledgeGraphProps {
  readonly pages: readonly WebPage[];
  readonly metricScores: Readonly<Record<string, number>>;
  readonly metric: 'keyword' | 'pagerank' | 'hybrid' | 'behaviour';
  readonly metricLabel: string;
  readonly selectedId: string | null;
  readonly onSelect: (pageId: string | null) => void;
  readonly layout: LayoutMode;
  readonly keyPageIds: readonly string[];
  readonly height?: number;
}

export function KnowledgeGraph({
  pages,
  metricScores,
  metric,
  metricLabel,
  selectedId,
  onSelect,
  layout,
  keyPageIds,
  height = 560,
}: KnowledgeGraphProps) {
  const ranked = useMemo(() => {
    const order = pages
      .map((page) => ({ page, score: metricScores[page.id] ?? 0 }))
      .sort((a, b) => b.score - a.score || a.page.id.localeCompare(b.page.id));
    const ranks = new Map<string, number>();
    order.forEach((entry, index) => ranks.set(entry.page.id, index + 1));
    return { order, ranks };
  }, [metricScores, pages]);

  const positions = useMemo<Record<string, Point>>(
    () =>
      layout === 'force'
        ? computeForceLayout(pages)
        : computeCircularLayout(pages),
    [layout, pages],
  );

  const buildNodes = useCallback(
    (currentPositions: Record<string, Point>): PageNodeType[] =>
      pages.map((page) => {
        const score = metricScores[page.id] ?? 0;
        return {
          id: page.id,
          type: PAGE_NODE_TYPE,
          position: currentPositions[page.id] ?? { x: 0, y: 0 },
          selected: selectedId === page.id,
          data: {
            page,
            rank: ranked.ranks.get(page.id) ?? 0,
            score,
            color: metricColor(score, metric),
            isKey: keyPageIds.includes(page.id),
            selected: selectedId === page.id,
            metricLabel,
          },
        };
      }),
    [keyPageIds, metric, metricLabel, metricScores, pages, ranked.ranks, selectedId],
  );

  const [nodes, setNodes] = useState<PageNodeType[]>(() => buildNodes(positions));

  useEffect(() => {
    setNodes(buildNodes(positions));
  }, [buildNodes, positions]);

  useEffect(() => {
    setNodes((previous) =>
      previous.map((node) => {
        const score = metricScores[node.id] ?? 0;
        return {
          ...node,
          selected: selectedId === node.id,
          data: {
            ...node.data,
            rank: ranked.ranks.get(node.id) ?? node.data.rank,
            score,
            color: metricColor(score, metric),
            isKey: keyPageIds.includes(node.id),
            selected: selectedId === node.id,
            metricLabel,
          },
        };
      }),
    );
  }, [keyPageIds, metric, metricLabel, metricScores, ranked.ranks, selectedId]);

  const onNodesChange = useCallback(
    (changes: NodeChange<PageNodeType>[]) => {
      setNodes((previous) => applyNodeChanges(changes, previous));
    },
    [],
  );

  const edges = useMemo<Edge[]>(() => {
    const validIds = new Set(pages.map((page) => page.id));
    const result: Edge[] = [];
    pages.forEach((page) => {
      page.links.forEach((target) => {
        if (!validIds.has(target)) return;
        const touchesSelection =
          selectedId !== null && (page.id === selectedId || target === selectedId);
        result.push({
          id: `${page.id}->${target}`,
          source: page.id,
          target,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: touchesSelection ? '#2563eb' : '#94a3b8',
          },
          style: {
            stroke: touchesSelection ? '#2563eb' : '#cbd5e1',
            strokeWidth: touchesSelection ? 2 : 1.25,
            opacity: selectedId === null || touchesSelection ? 1 : 0.35,
          },
          animated: touchesSelection,
        });
      });
    });
    return result;
  }, [pages, selectedId]);

  return (
    <div
      className="grid-paper relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelect(node.id)}
        onPaneClick={() => onSelect(null)}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.25}
        maxZoom={1.8}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        aria-label="Interactive directed hyperlink graph"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => String(node.data.color ?? '#94a3b8')}
          maskColor="rgba(248, 250, 252, 0.75)"
          className="!bg-white"
        />
      </ReactFlow>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 text-[10px] font-medium text-slate-500 backdrop-blur">
        Drag nodes · scroll to zoom · click to inspect
      </div>
    </div>
  );
}
