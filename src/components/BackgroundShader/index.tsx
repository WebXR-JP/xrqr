import React, { useRef, useEffect, useCallback } from 'react'
import styles from './styles.module.css'

// 背景シェーダーコンポーネント
const BackgroundShader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const programRef = useRef<WebGLProgram | null>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null
    resolution: WebGLUniformLocation | null
  }>({ time: null, resolution: null })
  const startTimeRef = useRef<number>(Date.now())

  // WebGLプログラムの初期化
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return false
    }

    glRef.current = gl

    // シェーダーソースコード
    const vertexShaderSource = /* glsl */`
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `

    const fragmentShaderSource = /* glsl */`
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;

        // 複数の波紋を作成
        float wave1 = sin(distance(uv, vec2(0.3, 0.7)) * 15.0 - time * 2.0) * 0.5 + 0.5;
        float wave2 = sin(distance(uv, vec2(0.7, 0.3)) * 12.0 - time * 1.5) * 0.5 + 0.5;
        float wave3 = sin(distance(uv, vec2(0.5, 0.5)) * 18.0 - time * 2.5) * 0.5 + 0.5;

        // 波紋を組み合わせ
        float combinedWaves = (wave1 + wave2 + wave3) / 3.0;

        // グラデーションベース（より濃い色合い）
        vec3 color1 = vec3(0.85, 1.00, 0.92); // より濃い薄青
        vec3 color2 = vec3(0.75, 0.80, 0.85); // より濃い中間色
        vec3 color3 = vec3(0.65, 0.70, 0.78); // より濃い暗色

        // UVベースのグラデーション
        vec3 gradient = mix(color1, color2, uv.y);
        gradient = mix(gradient, color3, uv.x * 0.5);

        // 波紋を適用（より強い変化）
        vec3 finalColor = gradient + combinedWaves * 0.15;

        // 微細なノイズ追加
        float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
        finalColor += noise;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    // シェーダーをコンパイル
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type)
      if (!shader) return null

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)

    if (!vertexShader || !fragmentShader) return false

    // プログラムを作成
    const program = gl.createProgram()
    if (!program) return false

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return false
    }

    programRef.current = program

    // Uniform変数の場所を取得
    uniformsRef.current = {
      time: gl.getUniformLocation(program, 'time'),
      resolution: gl.getUniformLocation(program, 'resolution')
    }

    // 頂点データ（フルスクリーン四角形）
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionAttribute = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionAttribute)
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    // 初期の解像度とタイムを設定
    if (uniformsRef.current.resolution) {
      gl.uniform2f(uniformsRef.current.resolution, canvas.clientWidth, canvas.clientHeight)
    }
    if (uniformsRef.current.time) {
      gl.uniform1f(uniformsRef.current.time, 0.0)
    }

    return true
  }, [])

  // キャンバスサイズを調整
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const gl = glRef.current
    if (!canvas || !gl) return

    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
      gl.viewport(0, 0, displayWidth, displayHeight)

      // 解像度のuniformを更新
      if (uniformsRef.current.resolution) {
        gl.uniform2f(uniformsRef.current.resolution, displayWidth, displayHeight)
      }
    }
  }, [])

  // アニメーションループ
  const animate = useCallback(() => {
    const gl = glRef.current
    if (!gl || !programRef.current) return

    try {
      resizeCanvas()

      // 時間を更新
      const currentTime = (Date.now() - startTimeRef.current) / 1000
      if (uniformsRef.current.time) {
        gl.uniform1f(uniformsRef.current.time, currentTime)
      }

      // 描画
      gl.clearColor(0.1, 0.1, 0.1, 1.0) // 少し明るいグレーに変更してデバッグ
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // WebGLエラーをチェック
      const error = gl.getError()
      if (error !== gl.NO_ERROR) {
        console.error('WebGL Error:', error)
      }

      animationRef.current = requestAnimationFrame(animate)
    } catch (error) {
      console.error('Animation error:', error)
    }
  }, [resizeCanvas])

  // 初期化とクリーンアップ
  useEffect(() => {
    const initialize = async () => {
      // 少し待ってからWebGLを初期化
      await new Promise(resolve => setTimeout(resolve, 100))

      if (initWebGL()) {
        resizeCanvas()
        animate()
      } else {
        console.error('WebGL initialization failed')
      }
    }

    initialize()

    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}

export default BackgroundShader