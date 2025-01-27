"use client";

import React, { useEffect, useRef } from 'react';

const AssistantSphere = ({ isVisible, isListening, response }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let particles = [];
    
    const resize = () => {
      canvas.width = 128;
      canvas.height = 128;
    };
    
    class Particle {
      constructor() {
        this.x = 64;
        this.y = 64;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = 20 + Math.random() * 20;
        this.speed = 0.02 + Math.random() * 0.02;
        this.opacity = 0.1 + Math.random() * 0.6;
      }
      
      update() {
        this.angle += this.speed;
        this.x = 64 + Math.cos(this.angle) * this.radius;
        this.y = 64 + Math.sin(this.angle) * this.radius;
        
        if (isListening) {
          this.opacity = 0.1 + Math.abs(Math.sin(this.angle)) * 0.3;
        }
      }
      
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }
    
    const init = () => {
      resize();
      particles = Array.from({ length: 20 }, () => new Particle());
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw base gradient
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(200, 0, 100, 0.6)');
      gradient.addColorStop(1, 'rgba(200, 0, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw swirling particles
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      
      // Draw connecting lines
      ctx.beginPath();
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(other => {
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 30) {
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
          }
        });
      });
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isVisible, isListening]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative w-32 h-32">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-full"
          style={{
            filter: 'blur(4px)',
            transform: 'scale(1.1)',
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-purple-700/10 rounded-full backdrop-blur-sm">
          <div className="absolute inset-2 bg-gradient-to-t from-transparent to-white/5 rounded-full"></div>
        </div>
      </div>
      
      {response && (
        <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-black/60 p-4 rounded-lg backdrop-blur-md min-w-[200px]">
          <p className="text-lg font-light text-center text-white">{response.visual}</p>
        </div>
      )}
    </div>
  );
};

export default AssistantSphere;