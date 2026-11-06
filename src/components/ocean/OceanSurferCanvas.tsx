import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WebPage } from '../../types';
import { computeForceLayout, type Point } from '../../utils/layout';
import type { SurferAnimationState, TransitionType } from '../../simulation/humanSurferEngine';

interface OceanSurferCanvasProps {
  readonly pages: readonly WebPage[];
  readonly pageRankScores: Readonly<Record<string, number>>;
  readonly currentPageId: string;
  readonly targetPageId: string | null;
  readonly animationState: SurferAnimationState;
  readonly progress: number; // 0 to 1
  readonly transitionType: TransitionType;
  readonly speechText: string | null;
  readonly followMode: boolean;
  readonly onSelectPage: (pageId: string) => void;
  readonly selectedPageId: string | null;
  readonly visitCounts: Readonly<Record<string, number>>;
  readonly totalVisits: number;
}

export function OceanSurferCanvas({
  pages,
  pageRankScores,
  currentPageId,
  targetPageId,
  animationState,
  progress,
  transitionType,
  speechText,
  followMode,
  onSelectPage,
  selectedPageId,
  visitCounts,
  totalVisits,
}: OceanSurferCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera transforms
  const [camera, setCamera] = useState<{ x: number; y: number; zoom: number }>({
    x: 0,
    y: 0,
    zoom: 1.0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; camX: number; camY: number }>({
    x: 0,
    y: 0,
    camX: 0,
    camY: 0,
  });

  // Calculate layout of islands in the ocean world
  const islandPositions = useMemo<Record<string, Point>>(() => {
    return computeForceLayout(pages, {
      width: 1400,
      height: 900,
      iterations: 300,
      seed: 1998,
    });
  }, [pages]);

  // Max PageRank for scaling island sizes
  const maxPR = useMemo(() => {
    return Math.max(...Object.values(pageRankScores), 0.0001);
  }, [pageRankScores]);

  // Current surfer position
  const surferPos = useMemo<Point>(() => {
    const currentPos = islandPositions[currentPageId] ?? { x: 700, y: 450 };
    if (!targetPageId || progress <= 0 || animationState === 'IDLE' || animationState === 'CELEBRATING') {
      return { x: currentPos.x, y: currentPos.y + 36 };
    }

    const targetPos = islandPositions[targetPageId] ?? currentPos;

    if (transitionType === 'TELEPORT' || transitionType === 'DANGLING_TELEPORT') {
      // During teleport: first half at current island shore, second half at target island shore
      return progress < 0.5
        ? { x: currentPos.x, y: currentPos.y + 36 }
        : { x: targetPos.x, y: targetPos.y + 36 };
    }

    // Normal wave riding: quadratic bezier arc between islands
    const startX = currentPos.x;
    const startY = currentPos.y + 30;
    const endX = targetPos.x;
    const endY = targetPos.y + 30;

    // Arch control point
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const perpX = -dy * 0.18;
    const perpY = dx * 0.18;
    const ctrlX = midX + perpX;
    const ctrlY = midY + perpY;

    const t = Math.max(0, Math.min(1, progress));
    const inv = 1 - t;
    const curX = inv * inv * startX + 2 * inv * t * ctrlX + t * t * endX;
    const curY = inv * inv * startY + 2 * inv * t * ctrlY + t * t * endY;

    return { x: curX, y: curY };
  }, [animationState, currentPageId, islandPositions, progress, targetPageId, transitionType]);

  // Smoothly update camera if followMode is active
  useEffect(() => {
    if (!followMode) return;
    setCamera((prev) => {
      const targetCamX = surferPos.x;
      const targetCamY = surferPos.y;
      const lerp = 0.12;
      return {
        x: prev.x + (targetCamX - prev.x) * lerp,
        y: prev.y + (targetCamY - prev.y) * lerp,
        zoom: prev.zoom,
      };
    });
  }, [followMode, surferPos]);

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Save base state
      ctx.save();

      // Apply camera transformation
      ctx.translate(width / 2, height / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);

      // --- 1. OCEAN WATER BACKGROUND ---
      // Vibrant retro 90s ocean gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 1400, 900);
      oceanGrad.addColorStop(0, '#1B4F72');
      oceanGrad.addColorStop(0.5, '#2874A6');
      oceanGrad.addColorStop(1, '#1A5276');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(-600, -600, 2600, 2100);

      // Subtle water waves pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      for (let y = -400; y < 1600; y += 45) {
        ctx.beginPath();
        for (let x = -400; x < 2000; x += 60) {
          const waveY = y + Math.sin(x * 0.03 + time + y * 0.02) * 5;
          if (x === -400) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }

      // Specular water glints
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 20; i++) {
        const glintX = (Math.sin(i * 99 + time * 0.3) * 0.5 + 0.5) * 1600 - 100;
        const glintY = (Math.cos(i * 77 + time * 0.25) * 0.5 + 0.5) * 1100 - 100;
        ctx.fillRect(glintX, glintY, 3, 2);
      }

      // --- 2. HYPERLINK WAVE ROUTES ---
      pages.forEach((page) => {
        const start = islandPositions[page.id];
        if (!start) return;

        page.links.forEach((targetId) => {
          const end = islandPositions[targetId];
          if (!end || page.id === targetId) return;

          const isActiveRoute =
            animationState === 'SURFING' &&
            transitionType === 'HYPERLINK' &&
            currentPageId === page.id &&
            targetPageId === targetId;

          const isSelectedRoute = selectedPageId === page.id;

          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const ctrlX = midX - dy * 0.15;
          const ctrlY = midY + dx * 0.15;

          // Route line
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.quadraticCurveTo(ctrlX, ctrlY, end.x, end.y);

          if (isActiveRoute) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 10;
          } else if (isSelectedRoute) {
            ctx.strokeStyle = 'rgba(255, 204, 0, 0.75)';
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 0;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // reset shadow

          // Directional arrow along curve
          const arrowT = 0.58;
          const invT = 1 - arrowT;
          const ax = invT * invT * start.x + 2 * invT * arrowT * ctrlX + arrowT * arrowT * end.x;
          const ay = invT * invT * start.y + 2 * invT * arrowT * ctrlY + arrowT * arrowT * end.y;

          // Tangent
          const tx = 2 * invT * (ctrlX - start.x) + 2 * arrowT * (end.x - ctrlX);
          const ty = 2 * invT * (ctrlY - start.y) + 2 * arrowT * (end.y - ctrlY);
          const angle = Math.atan2(ty, tx);

          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(angle);
          ctx.fillStyle = isActiveRoute ? '#00FFFF' : isSelectedRoute ? '#FFCC00' : 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.moveTo(5, 0);
          ctx.lineTo(-5, -3.5);
          ctx.lineTo(-3, 0);
          ctx.lineTo(-5, 3.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      });

      // --- 3. ISLANDS ---
      pages.forEach((page) => {
        const pos = islandPositions[page.id];
        if (!pos) return;

        const prScore = pageRankScores[page.id] ?? 0.05;
        const prRatio = Math.max(0.15, Math.min(1.0, prScore / maxPR));
        const islandRadius = 32 + prRatio * 38; // 32px to 70px

        const isCurrent = page.id === currentPageId;
        const isTarget = page.id === targetPageId && animationState !== 'IDLE';
        const isSelected = page.id === selectedPageId;

        // Shoreline water ripples
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, islandRadius + 6 + Math.sin(time * 3 + pos.x) * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Sandy Beach Ring
        ctx.fillStyle = '#ECC94B';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, islandRadius, 0, Math.PI * 2);
        ctx.fill();

        // Lush Green Center
        ctx.fillStyle = isCurrent ? '#2F855A' : '#38A169';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, islandRadius * 0.76, 0, Math.PI * 2);
        ctx.fill();

        // Selection / Beacon Ring
        if (isSelected || isCurrent || isTarget) {
          ctx.strokeStyle = isCurrent ? '#00FFFF' : isTarget ? '#FFCC00' : '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, islandRadius + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Swaying Palm Tree Details
        const sway = Math.sin(time * 2 + pos.x * 0.1) * 3;
        const trunkX = pos.x - islandRadius * 0.2;
        const trunkY = pos.y - islandRadius * 0.1;

        // Palm Trunk
        ctx.strokeStyle = '#8B5A2B';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(trunkX, trunkY);
        ctx.quadraticCurveTo(trunkX + sway * 0.5, trunkY - 14, trunkX + sway, trunkY - 24);
        ctx.stroke();

        // Palm Leaves
        ctx.fillStyle = '#22543D';
        const leafTipX = trunkX + sway;
        const leafTipY = trunkY - 24;
        [0, 1.2, 2.4, 3.6, 4.8].forEach((ang) => {
          ctx.beginPath();
          ctx.arc(leafTipX + Math.cos(ang) * 9, leafTipY + Math.sin(ang) * 6, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // If top authority, draw a tiny lighthouse / academic building
        if (prRatio > 0.75) {
          ctx.fillStyle = '#E2E8F0';
          ctx.fillRect(pos.x + 8, pos.y - 18, 10, 16);
          ctx.fillStyle = '#C53030';
          ctx.beginPath();
          ctx.moveTo(pos.x + 6, pos.y - 18);
          ctx.lineTo(pos.x + 13, pos.y - 25);
          ctx.lineTo(pos.x + 20, pos.y - 18);
          ctx.closePath();
          ctx.fill();
        }

        // Webpage Wooden Plank / Sign Badge Above Island
        ctx.fillStyle = isCurrent ? '#00008B' : '#4A5568';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        const badgeWidth = Math.min(140, Math.max(80, page.title.length * 6.5));
        const badgeHeight = 22;
        const badgeX = pos.x - badgeWidth / 2;
        const badgeY = pos.y - islandRadius - 30;

        // Signpost leg
        ctx.strokeStyle = '#8B5A2B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x, badgeY + badgeHeight);
        ctx.lineTo(pos.x, pos.y - islandRadius);
        ctx.stroke();

        // Sign plate
        ctx.fillStyle = isCurrent ? '#000080' : '#2D3748';
        ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
        ctx.strokeStyle = isCurrent ? '#00FFFF' : '#CBD5E0';
        ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);

        // Sign text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const truncatedTitle = page.title.length > 18 ? page.title.slice(0, 16) + '..' : page.title;
        ctx.fillText(truncatedTitle, pos.x, badgeY + 11);

        // Visit Count Pill
        const vCount = visitCounts[page.id] ?? 0;
        const vPercent = totalVisits > 0 ? ((vCount / totalVisits) * 100).toFixed(0) : '0';
        ctx.fillStyle = isCurrent ? '#FFCC00' : '#E2E8F0';
        ctx.font = '9px sans-serif';
        ctx.fillText(`🚩 ${vCount} (${vPercent}%)`, pos.x, badgeY + badgeHeight + 8);
      });

      // --- 4. TELEPORT PORTAL EFFECT ---
      if (
        (animationState === 'TELEPORTING' ||
          (transitionType === 'TELEPORT' && progress > 0.05 && progress < 0.95))
      ) {
        const portalCenter = surferPos;
        const portalRadius = 24 + Math.sin(time * 8) * 6;

        ctx.save();
        ctx.translate(portalCenter.x, portalCenter.y);
        ctx.rotate(time * 6);

        // Swirling galaxy vortex
        const portalGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, portalRadius);
        portalGrad.addColorStop(0, '#FFFFFF');
        portalGrad.addColorStop(0.3, '#00FFFF');
        portalGrad.addColorStop(0.7, '#805AD5');
        portalGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = portalGrad;
        ctx.beginPath();
        ctx.arc(0, 0, portalRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle arms
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(portalRadius * 0.5, portalRadius * 0.5, portalRadius, 0);
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- 5. THE ANIMATED HUMAN SURFER CHARACTER ---
      // Surfer only hidden during the instant middle of teleport
      const isTeleportInvisible =
        (transitionType === 'TELEPORT' || transitionType === 'DANGLING_TELEPORT') &&
        progress > 0.45 &&
        progress < 0.55;

      if (!isTeleportInvisible) {
        ctx.save();
        ctx.translate(surferPos.x, surferPos.y);

        // Calculate surfboard tilt angle based on travel vector
        let tiltAngle = 0;
        if (animationState === 'SURFING' && targetPageId) {
          const curTarget = islandPositions[targetPageId];
          const curSrc = islandPositions[currentPageId];
          if (curTarget && curSrc) {
            tiltAngle = Math.atan2(curTarget.y - curSrc.y, curTarget.x - curSrc.x) * 0.3;
          }
        } else if (animationState === 'CELEBRATING') {
          // 360 degree spin in celebration
          tiltAngle = time * 8;
        } else {
          // Gentle idle water bobbing tilt
          tiltAngle = Math.sin(time * 3) * 0.08;
        }

        ctx.rotate(tiltAngle);

        // Water wake & spray behind the surfboard
        if (animationState === 'SURFING') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          for (let p = 0; p < 6; p++) {
            const sprayX = -18 - p * 5 + (Math.random() - 0.5) * 4;
            const sprayY = 8 + (Math.random() - 0.5) * 6;
            ctx.beginPath();
            ctx.arc(sprayX, sprayY, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // SURFBOARD (Retro 1990s surfboard)
        // Board shadow on water
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 22, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Board Body (White fiberglass with retro cyan rail)
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#00CED1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 5, 20, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Red/Yellow Racing Stringer line down the surfboard
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-18, 5);
        ctx.lineTo(18, 5);
        ctx.stroke();

        // Fin underneath
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(-12, 6);
        ctx.lineTo(-14, 11);
        ctx.lineTo(-9, 6);
        ctx.closePath();
        ctx.fill();

        // HUMAN SURFER CHARACTER (Pixel-art inspired 2D figure)
        const bob = Math.sin(time * 4) * 1.5;

        // Legs (Surfer stance: bent knees, feet apart on board)
        ctx.strokeStyle = '#ED8936'; // Tan skin
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Back leg
        ctx.moveTo(-8, 4);
        ctx.lineTo(-6, -4 + bob);
        ctx.lineTo(-2, -10 + bob);
        // Front leg
        ctx.moveTo(8, 4);
        ctx.lineTo(6, -4 + bob);
        ctx.lineTo(2, -10 + bob);
        ctx.stroke();

        // Boardshorts (Vintage retro Google multi-colour stripes)
        ctx.fillStyle = '#0000CC';
        ctx.fillRect(-6, -14 + bob, 12, 7);
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(-6, -11 + bob, 12, 2);
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(-6, -9 + bob, 12, 2);

        // Torso / Rashguard
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000080';
        ctx.lineWidth = 1;
        ctx.fillRect(-5, -24 + bob, 10, 11);
        ctx.strokeRect(-5, -24 + bob, 10, 11);

        // Arms (Balancing stance: arms out sideways, hands balancing)
        ctx.strokeStyle = '#ED8936';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (animationState === 'CELEBRATING') {
          // Shaka hands in the air!
          ctx.moveTo(-4, -20 + bob);
          ctx.lineTo(-12, -32 + bob);
          ctx.moveTo(4, -20 + bob);
          ctx.lineTo(12, -32 + bob);
        } else {
          // Surfing balancing arms
          ctx.moveTo(-4, -20 + bob);
          ctx.lineTo(-14, -18 + bob);
          ctx.lineTo(-18, -14 + bob);
          ctx.moveTo(4, -20 + bob);
          ctx.lineTo(14, -22 + bob);
          ctx.lineTo(18, -26 + bob);
        }
        ctx.stroke();

        // Head (Tan skin, sunglasses, retro bleached surfer hair)
        ctx.fillStyle = '#ED8936';
        ctx.beginPath();
        ctx.arc(0, -29 + bob, 5, 0, Math.PI * 2);
        ctx.fill();

        // Bleached blonde/brown hair
        ctx.fillStyle = '#F6E05E';
        ctx.beginPath();
        ctx.arc(0, -31 + bob, 5, Math.PI, Math.PI * 2);
        ctx.fill();

        // 1990s Cool Sunglasses
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(-1, -30 + bob, 5, 2.5);

        ctx.restore();
      }

      // --- 6. SURFER SPEECH BUBBLE ---
      if (speechText) {
        ctx.save();
        ctx.translate(surferPos.x, surferPos.y - 45);

        ctx.font = 'bold 11px sans-serif';
        const textWidth = ctx.measureText(speechText).width;
        const bubbleW = textWidth + 16;
        const bubbleH = 22;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;

        // Rounded rect bubble
        ctx.beginPath();
        ctx.roundRect(-bubbleW / 2, -bubbleH, bubbleW, bubbleH, 4);
        ctx.fill();
        ctx.stroke();

        // Tail pointing to surfer
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(0, 5);
        ctx.lineTo(3, 0);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#0000CC';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(speechText, 0, -bubbleH / 2);

        ctx.restore();
      }

      // Restore camera state
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    animationState,
    camera,
    currentPageId,
    islandPositions,
    maxPR,
    pageRankScores,
    pages,
    progress,
    selectedPageId,
    speechText,
    surferPos,
    targetPageId,
    totalVisits,
    transitionType,
    visitCounts,
  ]);

  // Click handler to select an island
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (clickX - canvas.width / 2) / camera.zoom + camera.x;
    const worldY = (clickY - canvas.height / 2) / camera.zoom + camera.y;

    // Hit test islands
    for (const page of pages) {
      const pos = islandPositions[page.id];
      if (!pos) continue;
      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 48) {
        onSelectPage(page.id);
        return;
      }
    }
  };

  // Mouse drag panning handlers (World Mode)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    setIsDragging(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      camX: camera.x,
      camY: camera.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true);
      setCamera((prev) => ({
        x: dragStartRef.current.camX - dx / prev.zoom,
        y: dragStartRef.current.camY - dy / prev.zoom,
        zoom: prev.zoom,
      }));
    }
  };

  const handleMouseUp = () => {
    // End drag
  };

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.1 : 0.9;
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.4, Math.min(2.2, prev.zoom * zoomDelta)),
    }));
  }, []);

  // Center Camera on Surfer
  const handleResetCamera = () => {
    setCamera({
      x: surferPos.x,
      y: surferPos.y,
      zoom: 1.0,
    });
  };

  return (
    <div className="relative w-full overflow-hidden border-2 border-[#808080] bg-[#1B4F72] shadow-inner select-none">
      <canvas
        ref={canvasRef}
        width={960}
        height={560}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-[520px] sm:h-[560px] cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Canvas Camera Controls Overlay */}
      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/90 p-1 border border-[#808080] text-xs">
        <button
          type="button"
          onClick={() => setCamera((c) => ({ ...c, zoom: Math.min(2.2, c.zoom * 1.2) }))}
          className="btn-retro text-xs px-2 py-0.5"
          title="Zoom In"
        >
          🔍 +
        </button>
        <button
          type="button"
          onClick={() => setCamera((c) => ({ ...c, zoom: Math.max(0.4, c.zoom * 0.8) }))}
          className="btn-retro text-xs px-2 py-0.5"
          title="Zoom Out"
        >
          🔍 -
        </button>
        <button
          type="button"
          onClick={handleResetCamera}
          className="btn-retro text-xs px-2 py-0.5"
          title="Center on Surfer"
        >
          🎯 Center
        </button>
      </div>

      {/* Bottom Instructions / Hint */}
      <div className="absolute bottom-2 left-2 bg-black/75 text-white px-2 py-1 text-[11px] font-mono border border-white/20">
        🏄 Drag to pan ocean · Scroll to zoom · Click any island to inspect
      </div>
    </div>
  );
}

