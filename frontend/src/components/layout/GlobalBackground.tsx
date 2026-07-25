import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseX: number;
  baseY: number;
}

export const GlobalBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize nodes
    const nodeCount = Math.min(Math.floor((width * height) / 35000), 40);
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 3 + 2,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinate around center
      mouseRef.current.targetX = (e.clientX - width / 2) * 0.04;
      mouseRef.current.targetY = (e.clientY - height / 2) * 0.04;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Detect dark mode
      const isDark = document.documentElement.classList.contains('dark');
      
      // Theme colors
      const nodeColor = isDark ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.15)';
      const lineColor = isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(226, 232, 240, 0.7)';
      
      // Interpolate mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Draw connections first
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        
        // Update position (physics drift + parallax offset)
        n1.baseX += n1.vx;
        n1.baseY += n1.vy;

        // Wrap around boundaries
        if (n1.baseX < 0) n1.baseX = width;
        if (n1.baseX > width) n1.baseX = 0;
        if (n1.baseY < 0) n1.baseY = height;
        if (n1.baseY > height) n1.baseY = 0;

        // Render positions apply mouse parallax
        n1.x = n1.baseX + mouseRef.current.x;
        n1.y = n1.baseY + mouseRef.current.y;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 120) {
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
          }
        }
      }
      ctx.stroke();

      // Draw floating nodes & cubes
      nodes.forEach((node, idx) => {
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        
        // Draw small floating circles for most nodes, but floating isometric cubes for others
        if (idx % 6 === 0) {
          // Draw small isometric cube structure
          const size = 6;
          ctx.strokeStyle = isDark ? 'rgba(255, 107, 53, 0.4)' : 'rgba(255, 107, 53, 0.3)';
          ctx.lineWidth = 1.2;
          
          // Draw top face
          ctx.beginPath();
          ctx.moveTo(node.x, node.y - size);
          ctx.lineTo(node.x + size * 1.2, node.y - size/2);
          ctx.lineTo(node.x, node.y);
          ctx.lineTo(node.x - size * 1.2, node.y - size/2);
          ctx.closePath();
          ctx.stroke();
          
          // Draw vertical lines
          ctx.beginPath();
          ctx.moveTo(node.x - size * 1.2, node.y - size/2);
          ctx.lineTo(node.x - size * 1.2, node.y + size/2);
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(node.x, node.y + size);
          ctx.moveTo(node.x + size * 1.2, node.y - size/2);
          ctx.lineTo(node.x + size * 1.2, node.y + size/2);
          ctx.stroke();
          
          // Draw bottom faces
          ctx.beginPath();
          ctx.moveTo(node.x - size * 1.2, node.y + size/2);
          ctx.lineTo(node.x, node.y + size);
          ctx.lineTo(node.x + size * 1.2, node.y + size/2);
          ctx.stroke();
        } else {
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none">
      {/* Subtle blueprint line overlay */}
      <div className="absolute inset-0 blueprint-grid opacity-100" />
      <div className="absolute inset-0 blueprint-grid-sub opacity-100" />
      
      {/* Interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 dark:bg-slate-900/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/20 dark:bg-orange-950/10 blur-[120px] pointer-events-none" />
    </div>
  );
};
