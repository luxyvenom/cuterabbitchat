import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  sway: number;
  swaySpeed: number;
  type: 'snow' | 'heart';
  color: string;
}

const SnowEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const createParticles = () => {
      const count = 100; // Total number of particles
      particles = [];
      for (let i = 0; i < count; i++) {
        const isHeart = Math.random() > 0.85; // 15% chance of being a heart (눈이 더 많게)
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // 하트는 폰트 크기로 쓰이므로 15~25px, 눈은 반지름이므로 1.5~3.5px
          radius: isHeart ? Math.random() * 10 + 15 : Math.random() * 2 + 1.5,
          speed: Math.random() * 1 + 0.5,
          opacity: isHeart ? Math.random() * 0.4 + 0.6 : Math.random() * 0.5 + 0.3, // 하트는 좀 더 불투명하게
          sway: Math.random() * 2 * Math.PI,
          swaySpeed: Math.random() * 0.02 + 0.01,
          type: isHeart ? 'heart' : 'snow',
          // 하트는 핑크/레드 계열, 눈은 흰색
          color: isHeart ? '#FF6B6B' : '#ffffff' 
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update position
        p.y += p.speed;
        p.x += Math.sin(p.sway) * 0.5;
        p.sway += p.swaySpeed;

        // Reset if off screen
        // 하트가 더 크므로 여유 공간을 넉넉히 줌
        if (p.y > canvas.height + 30) { 
          p.y = -30;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 30) {
           p.x = -30;
        } else if (p.x < -30) {
           p.x = canvas.width + 30;
        }

        // Draw
        ctx.save(); // 스타일 오염 방지
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.type === 'snow') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        } else {
            // Draw Heart using Text Symbol for better visibility and performance
            ctx.font = `${p.radius}px sans-serif`; //radius를 폰트 크기로 사용
            ctx.fillText('♥', p.x, p.y);
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    updateParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default SnowEffect;
