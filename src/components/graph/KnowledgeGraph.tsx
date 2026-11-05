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
      return interpolateColor(value, [203, 213, 225], [0, 0, 204]);
    case 'behaviour':
      return interpolateColor(value, [203, 213, 225], [0, 128, 0]);
    case 'hybrid':
    default:
      return interpolateColor(value, [203, 213, 225], [0, 0, 139]);
  }
}

function PageNodeView({ data, selected }: NodeProps<PageNodeType>) {
  const isActive = selected || data.selected;
  return (
    <div
      className={cn(
        'w-[180px] bg-white text-black font-sans text-xs p-2 select-none cursor-pointer',
        isActive ? 'ring-2 ring-[#0000CC] bg-[#FFFFF0]' : 'hover:bg-[#F8F9FA]',
      )}
      style={{
        border: isActive ? '2px solid #0000CC' : '1px solid #808080',
        borderTop: `4px solid ${data.color}`,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-[#808080]"
      />
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="bg-[#EFEFEF] px-1 py-0.2 border border-[#CCCCCC] font-mono text-[10px] font-bold text-black">
          #{data.rank}
        </span>
        {data.isKey ? (
          <span className="text-[#BC0000] font-mono font-bold text-[9px] uppercase tracking-wide">
            [Anchor]
          </span>
        ) : null}
      </div>
      <p className="line-clamp-2 text-[11px] font-bold font-serif leading-tight text-[#0000CC]">
        {data.page.title}
      </p>
      <p className="mt-0.5 line-clamp-1 text-[10px] font-mono text-[#008000]">
        {data.page.url}
      </p>
      <div className="mt-1 flex items-center justify-between border-t border-[#EEEEEE] pt-1">
        <span className="text-[9px] uppercase tracking-wide text-[#777777]">
          {data.metricLabel}
        </span>
        <span className="font-mono text-[10px] font-bold text-black">
          {formatScore(data.score)}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-[#808080]"
      />
    </div>
  );
}

const nodeTypes = {
  [PAGE_NODE_TYPE]: PageNodeView,
};

export function KnowledgeGraph({
  pages,
  scores,
  selectedId,
  metric,
  metricLabel,
  layout = 'force',
  onSelectPage,
  keyPageIds,
}: {
  readonly pages: readonly WebPage[];
  readonly scores: Readonly<Record<string, number>>;
  readonly selectedId?: string | null;
  readonly metric: 'keyword' | 'pagerank' | 'hybrid' | 'behaviour';
  readonly metricLabel: string;
  readonly layout?: LayoutMode;
  readonly onSelectPage: (id: string | null) => void;
  readonly keyPageIds?: readonly string[];
}) {
  const keySet = useMemo(() => new Set(keyPageIds ?? []), [keyPageIds]);

  const pageRanks = useMemo(() => {
    const sorted = [...pages].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
    const ranks = new Map<string, number>();
    sorted.forEach((page, index) => ranks.set(page.id, index + 1));
    return ranks;
  }, [pages, scores]);

  const positions = useMemo(() => {
    const coords =
      layout === 'circular'
        ? computeCircularLayout(pages, { width: 700, height: 480 })
        : computeForceLayout(pages, { width: 700, height: 480 });
    const map = new Map<string, Point>();
    pages.forEach((page) => {
      map.set(page.id, coords[page.id] ?? { x: 350, y: 240 });
    });
    return map;
  }, [layout, pages]);

  const initialNodes: PageNodeType[] = useMemo(() => {
    return pages.map((page) => {
      const score = scores[page.id] ?? 0;
      const rank = pageRanks.get(page.id) ?? 1;
      const color = metricColor(score, metric);
      const isKey = keySet.has(page.id);
      const point = positions.get(page.id) ?? { x: 350, y: 240 };
      return {
        id: page.id,
        type: PAGE_NODE_TYPE,
        position: point,
        data: {
          page,
          rank,
          score,
          color,
          isKey,
          selected: page.id === selectedId,
          metricLabel,
        },
      };
    });
  }, [keySet, metric, metricLabel, pageRanks, pages, positions, scores, selectedId]);

  const [nodes, setNodes] = useState<PageNodeType[]>(initialNodes);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const onNodesChange = useCallback((changes: NodeChange<PageNodeType>[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const edges: Edge[] = useMemo(() => {
    const pageIds = new Set(pages.map((p) => p.id));
    const list: Edge[] = [];
    pages.forEach((source) => {
      source.links.forEach((targetId) => {
        if (!pageIds.has(targetId)) return;
        const edgeId = `${source.id}->${targetId}`;
        const connectsSelected = selectedId === source.id || selectedId === targetId;
        const isFromSelected = selectedId === source.id;
        list.push({
          id: edgeId,
          source: source.id,
          target: targetId,
          type: 'default',
          animated: connectsSelected,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: isFromSelected ? '#0000CC' : connectsSelected ? '#CC0000' : '#808080',
          },
          style: {
            stroke: isFromSelected ? '#0000CC' : connectsSelected ? '#CC0000' : '#A0A0A0',
            strokeWidth: connectsSelected ? 2 : 1,
          },
        });
      });
    });
    return list;
  }, [pages, selectedId]);

  return (
    <div className="relative h-[500px] w-full border border-[#808080] bg-white font-sans">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_event, node) => onSelectPage(node.id)}
        onPaneClick={() => onSelectPage(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#C0C0C0" />
        <Controls className="!border-[#808080] !bg-[#EFEFEF] !shadow-none !rounded-none" />
        <MiniMap
          nodeColor={(n) => (n.data?.color as string) ?? '#808080'}
          className="!border-[#808080] !bg-[#FAFAFA] !rounded-none"
        />
      </ReactFlow>
    </div>
  );
}
