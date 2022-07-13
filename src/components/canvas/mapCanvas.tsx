import { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { useData } from "../../hook/useData";


const Canvas = styled.canvas`
    

`

interface MapCanvasProps {

}

export function MapCanvas(props: MapCanvasProps) {
    const data = useData()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const requestAnimationRef = useRef<any>(null)

    useEffect(() => {
        const resize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth
                canvasRef.current.height = window.innerHeight
            }
        }

        resize()
        window.addEventListener('resize', resize)
        return () => {
            window.removeEventListener('resize', resize)
        }
    }, [])

    const drawRect = useCallback((x1: number, y1: number, x2: number, y2: number, strokeColor: string = '#1C99F9', fillColor: string = '#051525') => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return

        context.strokeStyle = strokeColor;
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        context.fillStyle = fillColor
        context.fillRect(x1, y1, x2 - x1, y2 - y1);
    }, [])

    // 렌더링 함수
    const render = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return

        context.clearRect(0, 0, canvas.width, canvas.height);
        Object.values(data.data.wall).forEach(e => {
            drawRect(e.x1, e.y1, e.x2, e.y2)
        })
        

        requestAnimationRef.current = requestAnimationFrame(render);
    }, [data.data.wall, drawRect])

    // 렌더링
    useEffect(() => {
        requestAnimationRef.current = requestAnimationFrame(render);
        return () => {
            cancelAnimationFrame(requestAnimationRef.current);
        };
    }, [render])

    return (
        <Canvas ref={canvasRef} />
    )
}