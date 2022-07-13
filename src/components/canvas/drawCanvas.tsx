import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useData } from "../../hook/useData";
import { useToast } from "../../hook/useToast";
import { v4 as uuidv4 } from 'uuid'
import { useWorker } from "../../hook/useWorker";


const Canvas = styled.canvas`
    cursor: crosshair;
    position: absolute;
    left: 0;
    top: 0;
    z-index: ${(props: {isDraw: boolean}) => props.isDraw ? 9999 : 0};
`

type vector = {
    x: number;
    y: number;
}

interface CanvasProps {

}

let paintTimer: NodeJS.Timeout | null = null;

export function DrawCanvas(props: CanvasProps) {
    const toast = useToast()
    const data = useData()
    const worker = useWorker()

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const requestAnimationRef = useRef<any>(null)

    const [ firstMousePosition, setFirstMousePosition ] = useState<vector>({x: 0, y: 0})
    const [ mousePosition, setMousePosition ] = useState<vector>({x: 0, y: 0})
    const [ isDraw, setIsDraw ] = useState(false);

    useEffect(() => {
        const resize = () => {
            if (canvasRef.current) {
                canvasRef.current.width=window.innerWidth
                canvasRef.current.height=window.innerHeight
            }
        }

        resize()
        window.addEventListener('resize', resize)
        return () => {
            window.removeEventListener('resize', resize)
        }
    }, [])

    const getMousePosition = useCallback((event: MouseEvent): vector | undefined => {
        return {
          x: event.pageX,
          y: event.pageY
        };
    }, []);

    const drawRect = useCallback((x1: number, y1: number, x2:number, y2: number, strokeColor: string = '#ffffff', fillColor: string = 'rgba(255, 255, 255, 0.09)') => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if(!context) return

        context.strokeStyle = strokeColor;
        context.strokeRect(x1, y1, x2-x1, y2-y1);
        context.fillStyle = fillColor
        context.fillRect(x1, y1, x2-x1, y2-y1);
    }, [])


    // 벽 그리기 시작
    const startDraw = useCallback((event: MouseEvent) => {
        toast.on('벽 생성을 취소하려면 ESC를 누르세요')
        const mousePosition = getMousePosition(event);
        if (!mousePosition) return
        
        setIsDraw(true)
        setMousePosition(mousePosition)
        setFirstMousePosition(mousePosition)
    }, [getMousePosition, toast])

    // 벽 그리기
    const draw = useCallback((event: MouseEvent) => {
        event?.preventDefault()
        if (!isDraw) return
        if (paintTimer) return
        paintTimer = setTimeout(() => {
            const newMousePosition = getMousePosition(event);
            if (firstMousePosition && newMousePosition) {
                setMousePosition(newMousePosition)
            }
            paintTimer = null
        }, 16)

    }, [firstMousePosition, getMousePosition, isDraw])

    // 그리기 취소
    const cancelPaint = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if(!context) return

        if (isDraw) {
            if (!mousePosition || !firstMousePosition) return
            toast.off()
            setIsDraw(false);
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [firstMousePosition, isDraw, mousePosition, toast])

    useEffect(() => {
        const cancel = (e:KeyboardEvent) => {
            if (e.code === 'Escape') cancelPaint()
        }
        document.addEventListener('keydown', cancel)
        return () => { document.removeEventListener('keydown', cancel) }
    }, [cancelPaint])
    
    const endDraw = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if(!context) return

        if (isDraw) {
            if (!mousePosition || !firstMousePosition) return
            toast.off()
            const rectVector = {
                x1: (firstMousePosition.x < mousePosition.x) ? firstMousePosition.x : mousePosition.x,
                y1: (firstMousePosition.y < mousePosition.y) ? firstMousePosition.y : mousePosition.y,
                x2: (firstMousePosition.x > mousePosition.x) ? firstMousePosition.x : mousePosition.x,
                y2: (firstMousePosition.y > mousePosition.y) ? firstMousePosition.y : mousePosition.y
            }

            const wallId = uuidv4()
            data.updateData('wall', { ...data.data.wall, [wallId]: rectVector })
            worker.requestWorker('wall', { ...data.data.wall, [wallId]: rectVector })

            setIsDraw(false);
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [data, firstMousePosition, isDraw, mousePosition, toast, worker])

     // 렌더링 함수
     const render = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if(!context) return

        if (isDraw && firstMousePosition && mousePosition) {
            context.beginPath()
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawRect(firstMousePosition.x, firstMousePosition.y, mousePosition.x, mousePosition.y)
        }

        requestAnimationRef.current = requestAnimationFrame(render);
    }, [drawRect, firstMousePosition, isDraw, mousePosition])

    // 렌더링
    useEffect(() => {
        requestAnimationRef.current = requestAnimationFrame(render);
        return () => {
            cancelAnimationFrame(requestAnimationRef.current);
        };
    }, [render])

    useEffect(() => {
        if (!canvasRef.current) return
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseleave', endDraw);

        return () => {
            canvas.removeEventListener('mousedown', startDraw);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', endDraw);
            canvas.removeEventListener('mouseleave', endDraw);
        }
    }, [draw, endDraw, startDraw])

    return (
        <Canvas ref={canvasRef} isDraw={isDraw} />
    )
}