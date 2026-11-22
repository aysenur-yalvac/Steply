"use client";

import { useEffect, useRef } from "react";

interface NeuralNoiseProps {
  color?: [number, number, number];
  opacity?: number;
  speed?: number;
}

export function NeuralNoise({
  color = [0.48, 0.2, 0.88],
  opacity = 0.42,
  speed = 0.0006,
}: NeuralNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, tX: window.innerWidth / 2, tY: window.innerHeight / 2 };
    let gl: WebGLRenderingContext | null = null;
    let uniforms: Record<string, WebGLUniformLocation | null> = {};
    let animationFrameId: number;

    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = 0.5 * (a_position + 1.0);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform vec3 u_color;
      uniform float u_speed;

      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }

      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.0);
        vec2 res = vec2(0.0);
        float scale = 8.0;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.0);
          sine_acc = rotate(sine_acc, 1.0);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (0.5 + 0.5 * cos(layer)) / scale;
          scale *= 1.2;
        }
        return res.x + res.y;
      }

      void main() {
        vec2 uv = 0.5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0.0, 1.0);
        p = 0.5 * pow(1.0 - p, 2.0);
        float t = u_speed * u_time;
        vec3 col = vec3(0.0);
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.0);
        noise += pow(noise, 10.0);
        noise = max(0.0, noise - 0.5);
        noise *= (1.0 - length(vUv - 0.5));
        col = u_color * noise;
        gl_FragColor = vec4(col, noise);
      }
    `;

    function createShader(context: WebGLRenderingContext, source: string, type: number) {
      const shader = context.createShader(type);
      if (!shader) return null;
      context.shaderSource(shader, source);
      context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        console.error("Shader compile error:", context.getShaderInfoLog(shader));
        context.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(context: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
      const program = context.createProgram();
      if (!program) return null;
      context.attachShader(program, vs);
      context.attachShader(program, fs);
      context.linkProgram(program);
      if (!context.getProgramParameter(program, context.LINK_STATUS)) {
        console.error("Program link error:", context.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    function getUniforms(context: WebGLRenderingContext, program: WebGLProgram) {
      const u: Record<string, WebGLUniformLocation | null> = {};
      const uniformCount = context.getProgramParameter(program, context.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const info = context.getActiveUniform(program, i);
        if (info) {
          u[info.name] = context.getUniformLocation(program, info.name);
        }
      }
      return u;
    }

    function initShader() {
      if (!canvasEl) return null;
      const context = (canvasEl.getContext("webgl") ||
        canvasEl.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (!context) return null;

      const vertexShader = createShader(context, vsSource, context.VERTEX_SHADER);
      const fragmentShader = createShader(context, fsSource, context.FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) return null;

      const shaderProgram = createProgram(context, vertexShader, fragmentShader);
      if (!shaderProgram) return null;

      uniforms = getUniforms(context, shaderProgram);

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const vertexBuffer = context.createBuffer();
      context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
      context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);

      context.useProgram(shaderProgram);
      const positionLocation = context.getAttribLocation(shaderProgram, "a_position");
      context.enableVertexAttribArray(positionLocation);
      context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);

      return context;
    }

    gl = initShader();
    if (!gl) return;

    function resizeCanvas() {
      if (!canvasEl || !gl) return;
      const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
      canvasEl.width = window.innerWidth * devicePixelRatio;
      canvasEl.height = window.innerHeight * devicePixelRatio;
      if (uniforms.u_ratio) {
        gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
      }
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    }

    const updateMousePosition = (x: number, y: number) => {
      pointer.tX = x;
      pointer.tY = y;
    };

    const pointermove = (e: PointerEvent) => updateMousePosition(e.clientX, e.clientY);
    const touchmove = (e: TouchEvent) => {
      if (e.targetTouches[0]) {
        updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
      }
    };
    const click = (e: MouseEvent) => updateMousePosition(e.clientX, e.clientY);

    window.addEventListener("pointermove", pointermove);
    window.addEventListener("touchmove", touchmove, { passive: true });
    window.addEventListener("click", click);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (uniforms.u_color) gl.uniform3f(uniforms.u_color, color[0], color[1], color[2]);
    if (uniforms.u_speed) gl.uniform1f(uniforms.u_speed, speed);

    function render() {
      if (!gl) return;
      const currentTime = performance.now();
      pointer.x += (pointer.tX - pointer.x) * 0.2;
      pointer.y += (pointer.tY - pointer.y) * 0.2;
      if (uniforms.u_time) gl.uniform1f(uniforms.u_time, currentTime);
      if (uniforms.u_pointer_position) {
        gl.uniform2f(
          uniforms.u_pointer_position,
          pointer.x / window.innerWidth,
          1 - pointer.y / window.innerHeight
        );
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", pointermove);
      window.removeEventListener("touchmove", touchmove);
      window.removeEventListener("click", click);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full pointer-events-none"
      style={{ opacity }}
    />
  );
}

export default NeuralNoise;
